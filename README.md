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
- Bottom tabs for **For Miller** and **Profile** are placeholder screens (their mock data is already in `mockData.js`); Kid Mode is a placeholder too

## Structure

```
App.js                        entry point, loads Fraunces/Public Sans/Baloo 2
src/theme/colors.js            prototype design tokens + CATEGORY_META
src/data/mockData.js           catalogue, therapist drops, success stories (from the prototype)
src/state/CartContext.js       mock cart + purchases state
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   Home, Library, ResourceDetail, Cart, Placeholder
src/navigation/RootNavigator.js  bottom tabs + stack for detail/Kid Mode
```

## Next steps (per the spec)

1. Build out **For Miller** (therapist resources + success stories tabs), **Profile**, and **Kid Mode** from the prototype — their data and designs are ready.
2. Wire up Supabase: auth, `resources` table, `purchases`, `therapist_resources`, `success_stories` (with row-level security scoped to the owning family).
3. Add Stripe checkout last, once the rest of the app works against real/mock data.

## Notes

- Dependency versions target **Expo SDK 56** (the version the Play Store / App Store build of Expo Go currently supports). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- The mock catalogue lives in `src/data/mockData.js` — edit titles/prices/categories there until Supabase is wired up.
