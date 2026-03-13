const AIRTABLE_TABLE = 'Proposals';

const SERVICES_PRICING = `
IMPORTANT: Never show hourly rates in the proposal. Show only investment ranges and value.

PROJECT SERVICES (one-time):
- Automation Setup (Make/Zapier): $2,000–$6,000
- Automation Audit (Make/Zapier): $1,000–$2,000
- CRM Implementation (Keap): $4,000–$12,000
- Airtable Buildout: $3,000–$8,000
- Airtable Audit: $1,000–$2,000
- Airtable Integrations: $2,000–$6,000
- API Integrations: $3,000–$8,000
- Softr Client Portal: $4,000–$10,000
- MVP Build: $8,000–$25,000
- Bubble Build: $10,000–$30,000
- Vibe Coded Website: $4,000–$10,000
- Full Martech Stack Audit & Implementation: $10,000–$30,000
- Copywriting: $2,000–$6,000
- Email Audit: $1,000–$2,000
- Email Deliverability Setup: $2,000–$4,000

RETAINER SERVICES (ongoing monthly, deeply discounted vs. ad-hoc):
- Essentials Retainer: $2,500/month — one platform managed, monthly reporting, up to 3 change requests, email support. Best for small businesses needing steady maintenance.
- Growth Retainer: $4,500/month — up to 2 platforms, bi-weekly check-ins, up to 8 change requests/month, quarterly strategy session, priority response. Core SMB tier.
- Partner Retainer: $7,500/month — full stack management, weekly syncs, unlimited requests under 2hrs, monthly strategy session, first access to senior time. For clients who want us embedded.
- Meta Ads Management: $3,000–$5,500/month (standalone retainer)
- Email Marketing Management: $2,500–$5,000/month (standalone retainer)

Overflow on any retainer billed at contracted rates — significantly below ad-hoc.
Non-profit discount: 15% off all investment ranges. Apply automatically if the business type is Non-profit.
Minimum engagement: $1,000.
`.trim();

export async function onRequestPost({ request, env }) {

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { firstName, lastName, email, businessName, website,
          bizType, teamSize, tools, challenge,
          services, budget, timeline } = body;

  if (!firstName || !email || !businessName || !services?.length) {
    return json({ error: 'Missing required fields' }, 400);
  }

  // ── Build Claude prompt ────────────────────────────────────────────────
  const prompt = `You are a proposal writer for Martech Consulting, a boutique martech consultancy run by Keith Phillips (Keap Certified Partner) and Jonathan Noury-Elliard. They specialize in marketing automation, CRM implementation, Airtable, Softr, Bubble, and digital marketing.

Generate a personalized proposal based on this prospect's submission.

PROSPECT:
Name: ${firstName} ${lastName}
Business: ${businessName}
Website: ${website || 'not provided'}
Business type: ${bizType}
Team size: ${teamSize}
Current tools: ${tools}
Biggest challenge: ${challenge}
Services interested in: ${Array.isArray(services) ? services.join(', ') : services}
Budget range: ${budget}
Timeline: ${timeline}

AVAILABLE SERVICES AND PRICE RANGES:
${SERVICES_PRICING}

INSTRUCTIONS:
- Select 2–4 services that best fit this prospect's situation and budget
- NEVER mention hourly rates anywhere in the proposal — show only investment ranges
- Always consider whether a retainer tier fits the prospect's situation. If they need ongoing work (ads, email marketing, CRM management, platform maintenance), recommend the appropriate retainer tier alongside or instead of project work
- If their budget is under $3K, recommend audits or the Essentials retainer as an entry point
- If business type is Non-profit, automatically apply a 15% discount to all investment ranges and note it with a single line: "Non-profit rate applied"
- Minimum engagement: $1,000 — never propose below this
- For retainer recommendations: frame them as ongoing partnership, not a recurring bill — emphasize priority access, predictability, and the contracted rate discount vs. ad-hoc work
- Do not recommend more than 4 services/tiers total — keep proposals focused
- Write the executive summary in a direct, human voice — no corporate fluff
- Each service rationale should reference something specific from their submission
- Scope bullets should be concrete deliverables, not vague promises
- Total range should be the sum of selected services (use the lower end for small budgets)
- Next steps should feel warm and low-pressure

Respond ONLY with valid JSON, no markdown, no backticks, no explanation:

{
  "executiveSummary": "2-3 sentences, personal and specific to their situation",
  "services": [
    {
      "name": "exact service name",
      "rationale": "1-2 sentences referencing their specific situation",
      "scope": ["deliverable 1", "deliverable 2", "deliverable 3"],
      "investmentRange": "$X,XXX – $X,XXX",
      "timeline": "X weeks",
      "isRetainer": false
    }
  ],
  "totalRange": "$X,XXX – $X,XXX",
  "projectTimeline": "X–X weeks total",
  "nextSteps": "1-2 sentences, warm and low-pressure"
}`;

  // ── Call Claude ────────────────────────────────────────────────────────
  let proposal;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Claude API error:', JSON.stringify(err));
      return json({ error: 'AI generation failed' }, 500);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    try {
      proposal = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Could not parse Claude response:', text);
        return json({ error: 'Failed to parse proposal' }, 500);
      }
      proposal = JSON.parse(match[0]);
    }

  } catch (err) {
    console.error('Claude call failed:', err);
    return json({ error: 'AI service unavailable' }, 500);
  }

  // ── Save to Airtable (awaited, errors surfaced) ────────────────────────
  const saveError = await saveToAirtable(body, proposal, env);
  if (saveError) {
    console.error('Airtable save failed:', saveError);
  }

  return json({ success: true, proposal, airtableError: saveError || null });
}

// ── Save to Airtable ──────────────────────────────────────────────────────
async function saveToAirtable(form, proposal, env) {
  try {
    const proposalText = buildPlainTextProposal(form, proposal);

    const res = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_PROPOSALS_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Name':          `${form.firstName} ${form.lastName}`,
            'Email':          form.email,
            'Business Name':  form.businessName,
            'Website':        form.website || '',
            'Business Type':  form.bizType,
            'Team Size':      form.teamSize,
            'Tools':          form.tools,
            'Challenge':      form.challenge,
            'Services':       Array.isArray(form.services) ? form.services.join(', ') : form.services,
            'Budget':         form.budget,
            'Timeline':       form.timeline,
            'Proposal JSON':  JSON.stringify(proposal),
            'Proposal body':  proposalText
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return JSON.stringify(err);
    }

    return null; // success

  } catch (err) {
    return err.message;
  }
}

// ── Build plain text version ──────────────────────────────────────────────
function buildPlainTextProposal(form, p) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const services = (p.services || []).map((svc, i) =>
    `${i + 1}. ${svc.name} — ${svc.investmentRange}\n   ${svc.rationale}\n   ${Array.isArray(svc.scope) ? svc.scope.map(s => `• ${s}`).join('\n   ') : svc.scope}\n   Timeline: ${svc.timeline}`
  ).join('\n\n');

  return `PROPOSAL FOR ${(form.businessName || '').toUpperCase()}
Prepared by Martech Consulting · ${today}

${p.executiveSummary}

RECOMMENDED SERVICES
${services}

TOTAL INVESTMENT: ${p.totalRange}
TIMELINE: ${p.projectTimeline}

NEXT STEPS
${p.nextSteps}

Ready to move forward? Book a free 30-minute discovery call:
https://calendly.com/d/cr79-s6m-dws/martech-meeting

Keith & Jon
Martech Consulting · martechconsulting.io`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
