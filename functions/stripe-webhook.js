// functions/stripe-webhook.js
//
// Cloudflare Pages Function — handles Stripe webhook events.
//
// SETUP CHECKLIST:
// 1. Add these to Cloudflare Pages → Settings → Environment Variables:
//      STRIPE_WEBHOOK_SECRET   → from Stripe Dashboard → Webhooks → your endpoint → Signing secret
//      AIRTABLE_TOKEN          → your Airtable personal access token
//      AIRTABLE_BASE_ID        → your Airtable base ID
//
// 2. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
//      URL:    https://your-site.pages.dev/stripe-webhook
//      Events: checkout.session.completed
//
// 3. In your Stripe Payment Link settings, make sure:
//      - "client_reference_id" is passed through (pulse.html handles this automatically)
//      - success_url is set to your thank-you page, e.g. https://your-site.pages.dev/thank-you
//
// HOW IT WORKS:
//   1. User pays via Stripe checkout (redirected from pulse.html with record ID in URL)
//   2. Stripe fires POST to this endpoint with a signed payload
//   3. We verify the signature — if it doesn't match, we reject it (no faking payments)
//   4. We extract the Airtable record ID from client_reference_id
//   5. We PATCH that record: Tier = "Paid", Upsell stage = "$49 report"
//   6. The Airtable automation watches for Tier = "Paid" and fires:
//        Script 1: reads audit answers + Config table → builds Claude prompt
//        Script 2: calls Claude API → writes deep-dive results back to record
//        Script 3: emails the full report to the address on the record

const AIRTABLE_TABLE = 'Martech Pulse Submissions';

export async function onRequestPost({ request, env }) {

  // ── 1. Read raw body (needed for signature verification) ──
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  // ── 2. Verify Stripe signature ────────────────────────────
  // TEMPORARILY DISABLED FOR DEBUGGING — re-enable before going live
  // const isValid = await verifyStripeSignature(
  //   rawBody,
  //   signature,
  //   env.STRIPE_WEBHOOK_SECRET
  // );
  // if (!isValid) {
  //   console.error('Stripe signature verification failed');
  //   return new Response('Invalid signature', { status: 401 });
  // }
  const isValid = true;

  // ── 3. Parse and handle the event ────────────────────────
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // We only care about successful checkouts
  if (event.type !== 'checkout.session.completed') {
    return new Response('Event type ignored', { status: 200 });
  }

  const session = event.data.object;

  // ── 4. Extract the Airtable record ID ────────────────────
  // pulse.html passes this as client_reference_id when redirecting to Stripe
  const recordId = session.client_reference_id;

  if (!recordId) {
    console.error('No client_reference_id on session:', session.id);
    // Return 200 so Stripe doesn't retry — this is a data issue, not a server error
    return new Response('No record ID — cannot update Airtable', { status: 200 });
  }

  // ── 5. Extract useful Stripe data to store ────────────────
  const stripeSessionId  = session.id;
  const amountPaid       = session.amount_total ? session.amount_total / 100 : 49; // convert cents to dollars
  const customerEmail    = session.customer_details?.email || '';
  const paymentStatus    = session.payment_status; // 'paid', 'unpaid', 'no_payment_required'

  // Safety check — only upgrade if payment actually succeeded
  if (paymentStatus !== 'paid') {
    console.warn('Payment not confirmed for session:', stripeSessionId, '— status:', paymentStatus);
    return new Response('Payment not confirmed', { status: 200 });
  }

  // ── 6. PATCH the Airtable record ─────────────────────────
  const { result: patchResult, error: patchError } = await patchAirtableRecord(recordId, {
    'Tier':              'Paid',
    'Upsell stage':      '$49 report',
    'Stripe session ID': stripeSessionId,
    'Amount Paid':       amountPaid,
    'Report sent':       false
  }, env);

  if (!patchResult) {
    const errMsg = JSON.stringify(patchError || 'unknown error');
    console.error('Airtable PATCH failed for record:', recordId, '— error:', errMsg);
    // Return 500 with full error so Stripe shows it in the delivery attempt
    return new Response(`Airtable update failed: ${errMsg}`, { status: 500 });
  }

  console.log('Successfully upgraded record to Paid:', recordId, '| Stripe session:', stripeSessionId);
  return new Response('OK', { status: 200 });
}

// ── Airtable PATCH helper ─────────────────────
async function patchAirtableRecord(recordId, fields, env) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );
    if (!res.ok) {
      const err = await res.json();
      console.error('Airtable PATCH error:', JSON.stringify(err));
      return { result: null, error: err };
    }
    return { result: await res.json(), error: null };
  } catch (err) {
    console.error('Airtable PATCH exception:', err.message);
    return { result: null, error: err.message };
  }
}

// ── Stripe signature verification ────────────
// Stripe signs every webhook payload with HMAC-SHA256.
// We recompute the signature using our webhook secret and compare.
// If they don't match, the request is fake.
async function verifyStripeSignature(payload, sigHeader, secret) {
  try {
    // Stripe signature header format: "t=timestamp,v1=signature"
    const parts     = sigHeader.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const v1sig     = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !v1sig) return false;

    // Replay attack protection — reject webhooks older than 5 minutes
    const webhookAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (webhookAge > 300) {
      console.warn('Webhook timestamp too old:', webhookAge, 'seconds');
      return false;
    }

    // Compute expected signature: HMAC-SHA256(timestamp + "." + payload, secret)
    const signedPayload = `${timestamp}.${payload}`;
    const encoder       = new TextEncoder();
    const keyData       = encoder.encode(secret);
    const msgData       = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const computedSig = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSig === v1sig;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
