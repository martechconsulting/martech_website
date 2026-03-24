// functions/api/hvac-lead.js
// Cloudflare Pages Function — token never exposed to the browser
//
// Env vars (Cloudflare dashboard > Settings > Environment Variables):
//   AIRTABLE_TOKEN             — personal access token
//   AIRTABLE_PROPOSALS_BASE_ID — apposb2VLlXXnUIMY

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Required field check
  const required = ['Name', 'Email', 'Phone', 'Company'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
        status: 422,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // Map to exact Airtable column names
  // Table: HVAC Website Build Lead Table (tbl4XLVSmIqJqd1pl)
  // Columns: Business Name, Address, Phone, Website Status, Rating,
  //          Facebook URL, Message Sent, Status, Notes,
  //          Contact, Brand Kit, Email, Website URL
  const fields = {
    'Business Name':  String(body.Company).trim(),
    'Contact':        String(body.Name).trim(),
    'Email':          String(body.Email).trim().toLowerCase(),
    'Phone':          String(body.Phone).trim(),
    'Address':        [body.City, body.State].filter(Boolean).join(', '),
    'Website Status': String(body.WebsiteStatus || '').trim(),
    'Facebook URL':   String(body.FacebookURL || '').trim(),
    'Website URL':    String(body.WebsiteURL || '').trim(),
    'Brand Kit':      String(body.BrandKit || '').trim(),
    'Status':         'New - Inbound',
    'Notes':          [
      body.BrandLink ? `Brand Files: ${body.BrandLink}` : '',
      body.Notes     ? body.Notes : '',
      'Source: Home Services Landing Page',
    ].filter(Boolean).join(' | '),
  };

  // Remove empty strings so Airtable doesn't complain about blank fields
  for (const [k, v] of Object.entries(fields)) {
    if (!v || String(v).trim() === '') delete fields[k];
  }

  // Table ID directly — immune to name changes
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_PROPOSALS_BASE_ID}/tbl4XLVSmIqJqd1pl`;

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
