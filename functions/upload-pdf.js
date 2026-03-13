// functions/upload-pdf.js

export async function onRequestPost({ request, env }) {

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { recordId, pdfBase64, filename } = body;

  if (!recordId || !pdfBase64) {
    return json({ error: 'Missing recordId or pdfBase64' }, 400);
  }

  const safeFilename = filename || 'proposal.pdf';

  // Decode base64 → binary
  const binaryStr = atob(pdfBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Build multipart/form-data body manually
  const boundary = '----AirtableBoundary' + Date.now().toString(36);
  const encoder  = new TextEncoder();

  const preamble = encoder.encode(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${safeFilename}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`
  );
  const suffix = encoder.encode(`\r\n--${boundary}--\r\n`);

  const multipart = new Uint8Array(preamble.length + bytes.length + suffix.length);
  multipart.set(preamble, 0);
  multipart.set(bytes, preamble.length);
  multipart.set(suffix, preamble.length + bytes.length);

  // Field name in URL must EXACTLY match your Airtable field name
  const fieldName  = 'PDF';
  const uploadUrl  = `https://content.airtable.com/v0/${env.AIRTABLE_PROPOSALS_BASE_ID}/${recordId}/uploadAttachment/${fieldName}`;

  console.log('Uploading PDF to:', uploadUrl);
  console.log('Record ID:', recordId);
  console.log('Filename:', safeFilename);
  console.log('PDF size (bytes):', bytes.length);

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization':              `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type':               `multipart/form-data; boundary=${boundary}`,
        'x-airtable-application-id':  env.AIRTABLE_PROPOSALS_BASE_ID,
      },
      body: multipart
    });

    const resText = await res.text();
    console.log('Airtable response status:', res.status);
    console.log('Airtable response body:', resText);

    if (!res.ok) {
      return json({ error: resText, status: res.status }, 500);
    }

    return json({ success: true });

  } catch (err) {
    console.error('PDF upload exception:', err.message);
    return json({ error: err.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
