// Stripe calls this after a checkout session completes. This is the ONLY place
// a purchase row is ever written — the app itself has no permission to insert
// into `purchases` (see schema.sql), so a purchase only exists once Stripe has
// actually confirmed the payment. Uses the service role key to bypass RLS,
// which is safe here because every insert is driven by a verified Stripe event,
// not by anything the client sent.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Verifies the Stripe-Signature header per Stripe's documented scheme:
// https://stripe.com/docs/webhooks#verify-manually
async function isValidStripeSignature(payload: string, sigHeader: string, secret: string) {
  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => p.split('=') as [string, string])
  );
  const timestamp = parts['t'];
  const expectedSig = parts['v1'];
  if (!timestamp || !expectedSig) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const computedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedSig === expectedSig;
}

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const payload = await req.text(); // must read the raw body before parsing — signature covers exact bytes

  if (!signature || !(await isValidStripeSignature(payload, signature, STRIPE_WEBHOOK_SECRET))) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const familyId: string | undefined = session.metadata?.family_id;
    const resourceIds: string[] = (session.metadata?.resource_ids ?? '')
      .split(',')
      .filter(Boolean);

    if (familyId && resourceIds.length > 0) {
      const rows = resourceIds.map((resource_id) => ({
        family_id: familyId,
        resource_id,
        stripe_session_id: session.id,
      }));
      const { error: insertError } = await admin.from('purchases').upsert(rows, {
        onConflict: 'family_id,resource_id',
        ignoreDuplicates: true,
      });
      if (insertError) {
        console.error('Failed to record purchase:', insertError.message, { familyId, resourceIds });
      }
    }
  }

  return new Response('ok', { status: 200 });
});
