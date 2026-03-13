export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const isPatch = body._method === 'PATCH';

  // PATCH needs the record ID in the URL — POST goes to the base table URL
  const url = isPatch
    ? `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Martech%20Pulse%20Submissions/${body.recordId}`
    : `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Martech%20Pulse%20Submissions`;

  const res = await fetch(url, {
    method: isPatch ? 'PATCH' : 'POST',
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: body.fields })
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
