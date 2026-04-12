// functions/api/pulse-submit.js
// Cloudflare Pages Function — route: /api/pulse-submit
// Used by: hospitality-pulse.html
//
// Env vars already set in Cloudflare Pages dashboard:
//   AIRTABLE_TOKEN             — personal access token
//   AIRTABLE_PROPOSALS_BASE_ID — apposb2VLlXXnUIMY

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const cors = {
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
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const fields = {
    'First Name':      String(body['First Name']  || '').trim(),
    'Last Name':       String(body['Last Name']   || '').trim(),
    'Email':           String(body['Email']        || '').trim(),
    'Property Name':   String(body['Property Name'] || '').trim(),
    'Property Type':   Array.isArray(body['Property Type']) ? body['Property Type'] : [],
    'Assets':          Array.isArray(body['Assets'])         ? body['Assets']         : [],
    'Score: Reach':      Number(body['Score: Reach'])      || 0,
    'Score: Tracking':   Number(body['Score: Tracking'])   || 0,
    'Score: Engagement': Number(body['Score: Engagement']) || 0,
    'Score: Pipeline':   Number(body['Score: Pipeline'])   || 0,
    'Score: Revenue':    Number(body['Score: Revenue'])    || 0,
    'Win Count':         Number(body['Win Count'])         || 0,
    'Quick Wins':        String(body['Quick Wins']  || '').substring(0, 10000),
    'OTA Dependency':    String(body['OTA Dependency']  || ''),
    'Has CRM':           String(body['Has CRM']          || ''),
    'Email Cadence':     String(body['Email Cadence']    || ''),
    'Response SLA':      String(body['Response SLA']     || ''),
    'Paid Social':       String(body['Paid Social']      || ''),
    'Source':            'hospitality-pulse',
  };

  let atRes;
  try {
    atRes = await fetch(
      'https://api.airtable.com/v0/apposb2VLlXXnUIMY/tblqnyAUwrWmi43es',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
  } catch (err) {
    console.error('Airtable fetch error:', err);
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const atData = await atRes.json();

  if (!atRes.ok) {
    console.error('Airtable error:', JSON.stringify(atData));
    return new Response(JSON.stringify({ success: false, error: atData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  return new Response(JSON.stringify({ success: true, id: atData.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
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
