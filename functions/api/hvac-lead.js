// functions/api/hvac-lead.js
// Cloudflare Pages Function — keeps the Airtable token server-side only
// Required env vars (set in Cloudflare dashboard, NOT in code):
//   AIRTABLE_TOKEN       — your personal access token
//   AIRTABLE_BASE_ID     — the base ID (starts with "app")
//   AIRTABLE_TABLE_NAME  — e.g. "Leads" (URL-encoded if it has spaces)

export async function onRequestPost({ request, env }) {
  // ── CORS preflight passthrough ──
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // ── Basic server-side validation ──
  const required = ['Name', 'Email', 'Phone', 'Company'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
        status: 422,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // ── Build Airtable fields ──
  // Map to whatever column names exist in your Leads base.
  // Adjust field names here to match exactly what's in Airtable.
  const fields = {
    'Name':         String(body.Name).trim(),
    'Email':        String(body.Email).trim().toLowerCase(),
    'Phone':        String(body.Phone).trim(),
    'Company':      String(body.Company).trim(),
    'City':         String(body.City || '').trim(),
    'State':        String(body.State || 'NH').trim(),
    'Notes':        String(body.Notes || '').trim(),
    'Lead Source':  'HVAC Website Landing Page',
    'Status':       'New',
  };

  // Remove empty optional fields
  for (const [k, v] of Object.entries(fields)) {
    if (v === '') delete fields[k];
  }

  const tableName = env.AIRTABLE_TABLE_NAME || 'Leads';
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;

  let atRes;
  try {
    atRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.error('Airtable fetch failed:', err);
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const atData = await atRes.json();

  if (!atRes.ok) {
    console.error('Airtable error:', JSON.stringify(atData));
    return new Response(JSON.stringify({ error: 'Could not save submission', detail: atData }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ success: true, id: atData.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Handle OPTIONS preflight
export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
