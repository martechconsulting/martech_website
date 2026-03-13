// functions/upload-pdf.js
//
// Receives a base64-encoded PDF from the browser and uploads it
// directly to the Airtable record's PDF attachment field.
//
// Called from proposal.html after the proposal is generated and rendered.

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

  // Upload directly to Airtable's Content API
  // This endpoint accepts raw file bytes and attaches them to the record
  const uploadUrl = `https://content.airtable.com/v0/${env.AIRTABLE_PROPOSALS_BASE_ID}/${recordId}/uploadAttachment/PDF`;

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization':             `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type':              'application/octet-stream',
        'x-airtable-application-id': env.AIRTABLE_PROPOSALS_BASE_ID,
        'Content-Disposition':       `attachment; filename="${filename || 'proposal.pdf'}"`,
      },
      body: bytes
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Airtable PDF upload failed:', JSON.stringify(err));
      return json({ error: JSON.stringify(err) }, 500);
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
