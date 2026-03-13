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

  // Decode base64 → binary
  const binaryStr = atob(pdfBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const safeFilename = filename || 'proposal.pdf';

  // Build multipart/form-data manually
  // Airtable's Content API requires: file (bytes), filename, contentType
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

  const encoder = new TextEncoder();
  const preamble = encoder.encode(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${safeFilename}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`
  );
  const suffix = encoder.encode(`\r\n--${boundary}--\r\n`);

  // Concatenate preamble + file bytes + suffix
  const multipart = new Uint8Array(preamble.length + bytes.length + suffix.length);
  multipart.set(preamble, 0);
  multipart.set(bytes, preamble.length);
  multipart.set(suffix, preamble.length + bytes.length);

  const uploadUrl = `https://content.airtable.com/v0/${env.AIRTABLE_PROPOSALS_BASE_ID}/${recordId}/uploadAttachment/PDF`;

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type':  `multipart/form-data; boundary=${boundary}`,
      },
      body: multipart
    });

    const resText = await res.text();

    if (!res.ok) {
      console.error('Airtable PDF upload failed:', res.status, resText);
      return json({ error: resText }, 500);
    }

    console.log('PDF uploaded successfully for record:', recordId);
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
