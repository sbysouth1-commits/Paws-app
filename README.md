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
App.js                        entry point, loads Fraunces/Public Sans/Baloo 2
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/state/CartContext.js       mock cart + purchases state
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   Home, Library, ResourceDetail, Cart, ForChild, Profile, KidMode
src/navigation/RootNavigator.js  bottom tabs + stack for detail and Kid Mode
```

## Next steps (per the spec)

All seven prototype screens are now built against mock data. Next:

1. Wire up Supabase: auth, `resources` table, `purchases`, `therapist_resources`, `success_stories` (with row-level security scoped to the owning family).
2. Add Stripe checkout last, once the rest of the app works against real/mock data.

## Notes

- Dependency versions target **Expo SDK 54** — the version the Play Store/App Store build of Expo Go supports as of July 2026 (Expo skipped store releases for 55/56; a 57 build is in review). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- The mock catalogue lives in `src/data/mockData.js` — edit titles/prices/categories there until Supabase is wired up.
