export async function onRequestPost({ request, env }) {
  const body = await request.json();

  const res = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Martech%20Pulse%20Submissions`,
    {
      method: body._method === 'PATCH' ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body._method === 'PATCH'
        ? { fields: body.fields }
        : { fields: body.fields }
      )
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
