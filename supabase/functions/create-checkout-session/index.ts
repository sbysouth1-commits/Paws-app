// Creates a Stripe Checkout session for whatever's in the shopper's cart.
// Runs with the caller's own auth (Supabase verifies the JWT before this code
// even runs), so it always knows exactly who's paying — the client can't spoof
// family_id. Prices are re-read from the `resources` table server-side, so a
// tampered client request can't change what gets charged.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
// Where Stripe sends the shopper after checkout. Defaults to the business site;
// override with a CHECKOUT_RETURN_URL secret to point somewhere else instead
// (e.g. a dedicated "thanks, head back to the app" page).
const RETURN_BASE = Deno.env.get('CHECKOUT_RETURN_URL') ?? 'https://pawsitivekids.com.au';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Flattens a nested object/array into Stripe's bracketed form-field notation,
// e.g. { line_items: [{ quantity: 1 }] } -> "line_items[0][quantity]=1".
function flatten(obj: unknown, prefix = ''): [string, string][] {
  const entries: [string, string][] = [];
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => entries.push(...flatten(v, `${prefix}[${i}]`)));
  } else if (obj !== null && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      entries.push(...flatten(v, prefix ? `${prefix}[${k}]` : k));
    }
  } else if (obj !== undefined && obj !== null) {
    entries.push([prefix, String(obj)]);
  }
  return entries;
}

function toFormBody(obj: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [k, v] of flatten(obj)) params.append(k, v);
  return params.toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return json({ error: 'Not signed in.' }, 401);
    const user = userData.user;

    const { resourceIds } = await req.json();
    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return json({ error: 'No items to check out.' }, 400);
    }

    const { data: resources, error: resError } = await supabase
      .from('resources')
      .select('id, title, price_aud')
      .in('id', resourceIds);
    if (resError) return json({ error: resError.message }, 500);
    if (!resources || resources.length === 0) {
      return json({ error: 'Those resources could not be found.' }, 400);
    }

    const { data: owned } = await supabase
      .from('purchases')
      .select('resource_id')
      .eq('family_id', user.id)
      .in('resource_id', resourceIds);
    const ownedIds = new Set((owned ?? []).map((o: { resource_id: string }) => o.resource_id));
    const toCharge = resources.filter((r: { id: string }) => !ownedIds.has(r.id));

    if (toCharge.length === 0) {
      return json({ error: 'You already own everything in your cart.' }, 400);
    }

    const lineItems = toCharge.map((r: { title: string; price_aud: number }) => ({
      quantity: 1,
      price_data: {
        currency: 'aud',
        unit_amount: Math.round(Number(r.price_aud) * 100),
        product_data: { name: r.title },
      },
    }));

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-06-20',
      },
      body: toFormBody({
        mode: 'payment',
        line_items: lineItems,
        customer_email: user.email,
        success_url: `${RETURN_BASE}/?checkout=success`,
        cancel_url: `${RETURN_BASE}/?checkout=cancelled`,
        metadata: {
          family_id: user.id,
          resource_ids: toCharge.map((r: { id: string }) => r.id).join(','),
        },
      }),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: session?.error?.message ?? 'Stripe could not start checkout.' }, 502);
    }

    return json({ url: session.url });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error.' }, 500);
  }
});
