# Pawsitive Kids (Expo)

## Run it

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## What's built

Design matches `app_prototype3.jsx` (tokens, category set, lucide stroke icons, paw SVG).

- **Home** — brand row, greeting, Kid Mode card, "From Priya" promo, "Picked for Miller's age" list, browse-by-focus-area tiles
- **Library** — full catalogue, category filter chips (Speech / OT / Sensory / Behaviour), static search bar
- **Resource Detail** — preview, blurb, dashed AUD price tag, working Add-to-cart (mock state), "Open resource" when owned
- **Cart** — line items, remove, total, mock "Pay with card" checkout that unlocks purchases
- **For [Child]** — segmented tabs: private resources from the therapist (with notes + open button) and success stories. The child/therapist names come from `family` in `mockData.js`, so nothing is hardcoded to "Miller"
- **Profile** — parent account card, purchase history (tap to open, from the mock cart), settings rows, and a working link out to pawsitivekids.com.au
- **Kid Mode** — simplified big-button grid of the child's unlocked activities, lock button to hand control back, and a full-screen activity preview. No purchasing or external links, per the spec

## Structure

```
App.js                        entry point; loads fonts, wraps app in AuthProvider, gates login
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/lib/supabase.js            Supabase client (null until keys are set)
src/state/AuthContext.js       Supabase session/login state
src/state/CartContext.js       mock cart + purchases state
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
3. For easy testing, turn off email confirmation: **Authentication → Sign In / Providers
   → Email → disable "Confirm email"** (turn it back on before real launch).
4. Copy `.env.example` to `.env` and fill in the two values from **Project Settings → API**
   (Project URL and the `anon` public key).
5. Restart with `npx expo start -c` (the `-c` clears the cache so the new `.env` loads).

Now the app opens on a **sign in / create account** screen; after login the session
persists on the device, and Profile gains a **Sign out** button. You (the business owner)
add therapist resources and success stories directly via the Supabase **Table editor**.

## Next steps (per the spec)

Auth is wired up. Next:

1. Read the `resources` catalogue (and `purchases`) from Supabase instead of mock data.
2. Add a one-time child-profile step, then load `therapist_resources` / `success_stories`
   for the For [Child] screen.
3. Add Stripe checkout last, once the rest of the app works against real data.

## Notes

- Dependency versions target **Expo SDK 54** — the version the Play Store/App Store build of Expo Go supports as of July 2026 (Expo skipped store releases for 55/56; a 57 build is in review). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- The mock catalogue lives in `src/data/mockData.js` — edit titles/prices/categories there until the catalogue is read from Supabase.
- `.env` is gitignored (never commit real keys); `.env.example` shows the shape. The Supabase `anon` key is safe in a client app — row-level security protects the data.
