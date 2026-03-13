// functions/generate-proposal.js
//
// Cloudflare Pages Function — generates a personalized proposal via Claude
// and saves it to Airtable.
//
// SETUP:
// Add to Cloudflare Pages → Settings → Environment Variables:
//   ANTHROPIC_API_KEY          → your Anthropic API key
//   AIRTABLE_TOKEN             → already set
//   AIRTABLE_PROPOSALS_BASE_ID → base ID for your proposals Airtable base (different from Pulse)
//
// Airtable: create a "Proposals" table with these fields:
//   Name (single line), Email (email), Business Name (single line),
//   Website (URL), Business Type (single line), Team Size (single line),
//   Tools (long text), Challenge (long text), Services (long text),
//   Budget (single line), Timeline (single line),
//   Proposal JSON (long text), Proposal body (long text),
//   Created (created time)

const AIRTABLE_TABLE = 'Proposals';

const SERVICES_PRICING = `
- Automation Setup (Make/Zapier): $500–$2,500
- Automation Audit (Make/Zapier): $299–$799
- CRM Implementation (Keap): $1,500–$5,000
- Airtable Buildout: $750–$3,000
- Airtable Audit: $299–$699
- Airtable Integrations: $500–$2,000
- API Integrations: $750–$3,500
- Softr Client Portal: $1,000–$3,500
- MVP Build: $2,500–$10,000
- Bubble Build: $2,500–$12,000
- Vibe Coded Website: $1,500–$5,000
- Full Martech Stack Audit & Implementation: $3,000–$15,000
- Meta Ads Management: $750–$2,500/month
- Copywriting: $500–$2,500
- Email Marketing Management: $750–$2,500/month
- Email Audit: $299–$699
- Email Deliverability Setup: $500–$1,500
`.trim();

export async function onRequestPost({ request, env }) {

  // ── Parse request ─────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const {
    firstName, lastName, email, businessName, website,
    bizType, teamSize, tools, challenge,
    services, budget, timeline
  } = body;

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
- If their budget is under $1K, recommend lower-ticket services like audits
- Write the executive summary in a direct, human voice — no corporate fluff
- Each service rationale should reference something specific from their submission
- Scope bullets should be concrete deliverables, not vague promises
- Total range should be the sum of selected services (use the lower end for small budgets)
- Next steps should feel warm and low-pressure

Respond ONLY with valid JSON, no markdown, no explanation:

{
  "executiveSummary": "2-3 sentences, personal and specific to their situation",
  "services": [
    {
      "name": "exact service name",
      "rationale": "1-2 sentences referencing their specific situation",
      "scope": ["deliverable 1", "deliverable 2", "deliverable 3"],
      "investmentRange": "$X,XXX – $X,XXX",
      "timeline": "X weeks"
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
      // Claude occasionally wraps JSON in backticks — strip them
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

  // ── Save to Airtable ───────────────────────────────────────────────────
  // Fire and forget — don't block the response on Airtable
  saveToAirtable(body, proposal, env).catch(err =>
    console.error('Airtable save failed:', err)
  );

  return json({ success: true, proposal });
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function saveToAirtable(form, proposal, env) {
  const proposalText = buildPlainTextProposal(form, proposal);

  await fetch(
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
}

function buildPlainTextProposal(form, p) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const services = (p.services || []).map((svc, i) =>
    `${i + 1}. ${svc.name} — ${svc.investmentRange}\n   ${svc.rationale}\n   ${Array.isArray(svc.scope) ? svc.scope.map(s => `• ${s}`).join('\n   ') : svc.scope}\n   Timeline: ${svc.timeline}`
  ).join('\n\n');

  return `PROPOSAL FOR ${form.businessName.toUpperCase()}
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
