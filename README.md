# Pawsitive Kids (Expo)

## Run it

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## What's built

Design matches `app_prototype3.jsx` (tokens, category set, lucide stroke icons, paw SVG).

- **Home** — brand row, greeting, Kid Mode card, "From Priya" promo, "Picked for Miller's age" list (live from Supabase), browse-by-focus-area tiles
- **Library** — full catalogue read from Supabase, category filter chips (Speech / OT / Sensory / Behaviour), static search bar, loading/retry states
- **Resource Detail** — preview, blurb, dashed AUD price tag, working Add-to-cart; "Open resource" when owned fetches a short-lived signed URL from Supabase Storage and opens the file
- **Cart** — line items, remove, total; "Pay with card" opens a real Stripe Checkout page (AUD) and the purchase is only recorded once Stripe confirms payment, with an instant mock checkout when there are no keys
- **For [Child]** — segmented tabs reading the child's private `therapist_resources` and `success_stories` from Supabase (mock fallback with no keys), each with a working "Open resource" download. After login, a one-time onboarding step collects the parent's name and creates the child profile; those names then drive the Home greeting, tab label, Kid Mode and Profile
- **Profile** — parent account card, purchase history (tap to open, from the mock cart), settings rows, and a working link out to pawsitivekids.com.au
- **Kid Mode** — simplified big-button grid of the child's unlocked activities, lock button to hand control back, and a full-screen activity preview. No purchasing or external links, per the spec
- **Admin** (owner-only) — a hidden "Admin" row on Profile, visible only to your own account, for adding/editing catalogue resources and dropping therapist resources or success stories onto a specific family's child — including picking a PDF straight from your phone. Replaces the manual Supabase table-editor + Storage-upload workflow described below (that still works too, if you'd rather use the dashboard for something)

## Structure

```
App.js                        entry point; loads fonts, wraps app in AuthProvider, gates login
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/lib/supabase.js            Supabase client (null until keys are set)
src/lib/fileAccess.js          signed-URL download helper for Storage files
src/lib/fileUpload.js          admin: pick + upload a file to a Storage bucket
src/state/AuthContext.js       Supabase session/login state
src/state/ChildContext.js      parent name + child profile + isAdmin (Supabase, or mock)
src/state/ResourcesContext.js  catalogue loader (Supabase, or mock fallback)
src/state/CartContext.js       cart + purchases; drives Stripe Checkout, never writes purchases itself
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   Auth, Home, Library, ResourceDetail, Cart, ForChild, Profile, KidMode
src/screens/admin/             Admin, ResourceForm, FamilyDetail, TherapistResourceForm, SuccessStoryForm
src/navigation/RootNavigator.js  bottom tabs + stack for detail, Kid Mode and Admin
supabase/schema.sql            database tables + row-level security
supabase/seed.sql              starter catalogue rows
supabase/functions/create-checkout-session  Edge Function: starts a Stripe Checkout session
supabase/functions/stripe-webhook           Edge Function: records a purchase once Stripe confirms payment
```

## Supabase setup (auth is built — connect it to go live)

The app runs on mock data until you add Supabase keys, so it keeps working in Expo
Go with no setup. To turn on real accounts:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard: **SQL Editor → New query**, paste in `supabase/schema.sql`, Run.
   Then do the same with `supabase/seed.sql` to fill the resource catalogue.
   (`schema.sql` is safe to re-run any time it changes — e.g. after pulling an
   update that adds a column — it only adds what's missing.)
3. For easy testing, turn off email confirmation: **Authentication → Sign In / Providers
   → Email → disable "Confirm email"** (turn it back on before real launch).
4. Copy `.env.example` to `.env` and fill in the two values from **Project Settings → API**
   (Project URL and the `anon` public key).
5. Restart with `npx expo start -c` (the `-c` clears the cache so the new `.env` loads).

Now the app opens on a **sign in / create account** screen; after login the session
persists on the device, and Profile gains a **Sign out** button. **Home and Library read
the `resources` catalogue live from Supabase** — edit a row in the Table editor and it
shows up in the app on next launch. You (the business owner) add therapist resources and
success stories directly via the Supabase **Table editor** too.

## Uploading a resource file (so "Open resource" has something to open)

`schema.sql` creates two **private** Storage buckets: `resource-files` (the paid
catalogue) and `therapist-files` (private per-child drops). Nothing in either bucket
is public — a family can only fetch a file it has actually purchased, or that was
shared with its own child; the app requests a signed URL that expires a few minutes
after it's generated.

To attach a file to a resource:

1. Dashboard → **Storage** → open **resource-files** (or **therapist-files** for a
   therapist drop) → **Upload file** → pick the PDF.
2. Click the uploaded file and copy its **path** (e.g. `big-feelings-toolkit.pdf` —
   just the file name if you uploaded to the bucket root).
3. Dashboard → **Table editor** → open the matching row in `resources` (or
   `therapist_resources`) → paste that exact path into the **file_url** column → Save.
4. In the app, reload the screen and tap **Open resource** — it opens in an in-app
   browser, where the phone's own PDF viewer/share sheet takes over.

The path in `file_url` must match the uploaded file's path exactly — that's what the
security policy checks against.

## Stripe checkout setup

"Pay with card" opens a **Stripe Checkout** page (Stripe's own hosted payment
page) in the same in-app browser used for file downloads — no card-payment SDK
in the app itself, so this still runs fine in plain Expo Go, no special build
needed. Two Supabase **Edge Functions** do the work: one creates the Checkout
session (using your Stripe secret key, which never touches the app), and the
other is a **webhook** Stripe calls once payment actually succeeds — that's the
only place a purchase ever gets recorded, so the app itself has no way to grant
a "purchase" without a real payment behind it.

Setup (all one-time):

1. Create a free [stripe.com](https://stripe.com) account. Test mode needs no
   business verification — you can build and test the whole flow before ever
   going live.
2. Dashboard → **Developers → API keys** → copy the **Secret key** (starts
   `sk_test_...`). Keep this out of the app entirely — it only ever goes into
   Supabase's secret store (next steps).
3. Install the Supabase CLI. Easiest on any OS — no install needed, just prefix
   every command below with `npx supabase@latest` instead of `supabase`. (If
   you'd rather have a permanent `supabase` command on Windows, install
   [Scoop](https://scoop.sh) first, then `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
   and `scoop install supabase`.)
4. In the `Paws-app` folder:
   ```
   npx supabase@latest login
   ```
   This opens a browser to authorize, same as `eas login` did earlier.
5. Link this project (find your **Reference ID** in the dashboard under
   **Project Settings → General** — it's also the subdomain in your project
   URL, e.g. `https://abcd1234.supabase.co` → ref is `abcd1234`):
   ```
   npx supabase@latest link --project-ref YOUR-PROJECT-REF
   ```
6. Set your Stripe secret key as a Supabase secret:
   ```
   npx supabase@latest secrets set STRIPE_SECRET_KEY=sk_test_...
   ```
7. Deploy both functions:
   ```
   npx supabase@latest functions deploy create-checkout-session
   npx supabase@latest functions deploy stripe-webhook --no-verify-jwt
   ```
8. Your webhook's URL is:
   `https://YOUR-PROJECT-REF.supabase.co/functions/v1/stripe-webhook`
9. Stripe dashboard → **Developers → Webhooks → Add endpoint** → paste that URL
   → under "Select events" choose **checkout.session.completed** → Add endpoint.
10. Click into the endpoint you just created → **Reveal** the **Signing secret**
    (starts `whsec_...`) → set it as a Supabase secret too:
    ```
    npx supabase@latest secrets set STRIPE_WEBHOOK_SECRET=whsec_...
    ```
    (No redeploy needed — secrets are read fresh on every call.)
11. Re-run `supabase/schema.sql` in the SQL Editor (it's idempotent) to pick up
    the new `stripe_session_id` column and the tightened purchases policy.
12. `git pull` on your PC, then `npx expo start -c` and reload the app.

**Testing:** use Stripe's test card `4242 4242 4242 4242`, any future expiry,
any 3-digit CVC, any postal code — it always "succeeds" in test mode. After
paying, closing the browser returns you to Cart, which checks with Supabase
and shows "Purchase complete" once the webhook has recorded it (usually
near-instant; the app waits and retries once if it needs to).

By default, Checkout sends the shopper back to **pawsitivekids.com.au** after
paying (a page you already control). To point somewhere else instead, set a
`CHECKOUT_RETURN_URL` secret the same way as the others above.

When you're ready to take real payments, switch your Stripe dashboard out of
test mode, grab the **live** secret key and webhook signing secret, and repeat
steps 6, 9 and 10 with those live values.

## Admin access (manage content from inside the app)

Instead of the Supabase table editor + manual Storage uploads, you can add
catalogue resources and drop private content onto a family's child right from
the app — a hidden **Admin** row appears on your Profile once your account is
flagged as the owner.

1. Sign up / log in in the app with the account you want to use as the owner,
   and finish the "Tell us about your family" step (you need at least one
   child profile on your own account too, same as any family).
2. In the Supabase dashboard, **SQL Editor → New query**, run (with your real
   login email):
   ```sql
   update public.families set is_admin = true where email = 'you@example.com';
   ```
3. Fully close and reopen the app (or sign out and back in) so it re-reads
   your account. **Profile → Admin** now appears.

From there:
- **Resources tab** — tap **+** to add a new catalogue resource (title,
  category, age range, price, description, tag, and an optional file upload),
  or tap any existing one to edit it.
- **Families tab** — lists every family that's finished onboarding. Tap one to
  see what's already been shared with their child, and add a new **therapist
  resource** or **success story** for them, with an optional file upload for
  resources.

Notes: the Admin section can add and edit, but never delete — that's on
purpose, so a mistake can't wipe out a family's purchase history or private
content. For the rare case you do need to delete something, use the Supabase
table editor (as project owner, which bypasses these limits). Only one
`is_admin = true` account exists unless you flag more — fine for a solo
business, and there's no invite flow to grant it to someone else in-app yet.

## Next steps (per the spec)

**V1 is feature-complete against the spec, plus an in-app Admin section.**
Auth, one child per family, the live catalogue, real purchases, private
therapist content, file downloads, paid checkout, and owner content management
are all wired up. To test the For [Child] screen with sample data, run
`supabase/sample_child_content.sql` after adding your child.

From here, per spec §6 ("Not in V1 — revisit later"): therapist
messaging/booking, subscriptions, and multiple children per family.

## Notes

- Dependency versions target **Expo SDK 54** — the version the Play Store/App Store build of Expo Go supports as of July 2026 (Expo skipped store releases for 55/56; a 57 build is in review). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- With Supabase configured, the catalogue comes from the `resources` table; with no keys, the app falls back to the mock catalogue in `src/data/mockData.js`. Both go through `src/state/ResourcesContext.js`.
- `.env` is gitignored (never commit real keys); `.env.example` shows the shape. The Supabase `anon`/publishable key is safe in a client app — row-level security protects the data.
- Stripe's secret key and webhook signing secret live only in Supabase's Edge Function secret store — never in `.env`, never in the app bundle, never committed.
