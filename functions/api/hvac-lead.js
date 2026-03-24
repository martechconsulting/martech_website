export async function onRequestPost({ request, env }) {
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

  // Server-side validation
  const required = ['Name', 'Email', 'Phone', 'Company'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
        status: 422,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // Pack everything the table lacks dedicated columns for into Notes
  const noteParts = [];
  if (body.Name)      noteParts.push(`Contact: ${String(body.Name).trim()}`);
  if (body.Email)     noteParts.push(`Email: ${String(body.Email).trim()}`);
  if (body.State)     noteParts.push(`State: ${String(body.State).trim()}`);
  if (body.BrandKit)  noteParts.push(`Brand Kit: ${String(body.BrandKit).trim()}`);
  if (body.BrandLink) noteParts.push(`Brand Link: ${String(body.BrandLink).trim()}`);
  if (body.Notes)     noteParts.push(`Notes: ${String(body.Notes).trim()}`);
  noteParts.push('Source: Home Services Landing Page');

  // Exact column names from HVAC Website Build Lead Table
  const fields = {
    'Business Name': String(body.Company).trim(),
    'Phone':         String(body.Phone).trim(),
    'Address':       [body.City, body.State].filter(Boolean).join(', '),
    'Status':        'New - Inbound',
    'Notes':         noteParts.join(' | '),
  };

  // Strip empty fields so Airtable doesn't choke
  for (const [k, v] of Object.entries(fields)) {
    if (!v || String(v).trim() === '') delete fields[k];
  }

  // Table ID used directly — no name encoding issues
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

// OPTIONS preflight
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
