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
- **Cart** — line items, remove, total; "Pay with card" saves the purchase to Supabase (owned resources persist across reloads), with mock fallback when there are no keys
- **For [Child]** — segmented tabs reading the child's private `therapist_resources` and `success_stories` from Supabase (mock fallback with no keys), each with a working "Open resource" download. After login, a one-time onboarding step collects the parent's name and creates the child profile; those names then drive the Home greeting, tab label, Kid Mode and Profile
- **Profile** — parent account card, purchase history (tap to open, from the mock cart), settings rows, and a working link out to pawsitivekids.com.au
- **Kid Mode** — simplified big-button grid of the child's unlocked activities, lock button to hand control back, and a full-screen activity preview. No purchasing or external links, per the spec

## Structure

```
App.js                        entry point; loads fonts, wraps app in AuthProvider, gates login
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/lib/supabase.js            Supabase client (null until keys are set)
src/lib/fileAccess.js          signed-URL download helper for Storage files
src/state/AuthContext.js       Supabase session/login state
src/state/ChildContext.js      parent name + child profile loader/creator (Supabase, or mock)
src/state/ResourcesContext.js  catalogue loader (Supabase, or mock fallback)
src/state/CartContext.js       cart + purchases (reads/writes Supabase `purchases`)
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   Auth, Home, Library, ResourceDetail, Cart, ForChild, Profile, KidMode
src/navigation/RootNavigator.js  bottom tabs + stack for detail and Kid Mode
supabase/schema.sql            database tables + row-level security
supabase/seed.sql              starter catalogue rows
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

## Next steps (per the spec)

Auth, the child profile, live catalogue, persisted purchases, private therapist
content, and file downloads are all wired up. To test the For [Child] screen with
sample data, run `supabase/sample_child_content.sql` after adding your child.
Remaining:

1. Add Stripe checkout, so "Pay with card" takes a real AUD payment before the
   purchase is recorded — the last piece of V1.

## Notes

- Dependency versions target **Expo SDK 54** — the version the Play Store/App Store build of Expo Go supports as of July 2026 (Expo skipped store releases for 55/56; a 57 build is in review). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- With Supabase configured, the catalogue comes from the `resources` table; with no keys, the app falls back to the mock catalogue in `src/data/mockData.js`. Both go through `src/state/ResourcesContext.js`.
- `.env` is gitignored (never commit real keys); `.env.example` shows the shape. The Supabase `anon`/publishable key is safe in a client app — row-level security protects the data.
