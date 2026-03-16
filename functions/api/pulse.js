export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const isPatch = body._method === 'PATCH';
    const tableName = 'Martech%20Pulse%20Submissions';
    const baseUrl = 'https://api.airtable.com/v0/' + env.AIRTABLE_BASE_ID + '/' + tableName;
    const url = isPatch ? baseUrl + '/' + body.recordId : baseUrl;

    const res = await fetch(url, {
      method: isPatch ? 'PATCH' : 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.AIRTABLE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: body.fields, typecast: true })
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
