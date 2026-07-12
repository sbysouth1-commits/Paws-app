# Pawsitive Kids (Expo)

## Run it

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` / `a` for a simulator.

## What's built

- **Home** — greeting, Kid Mode shortcut, "From Priya" promo, featured resources, browse-by-category grid
- **Library** — full catalogue, category filter chips, search bar (static for now)
- **Resource Detail** — tap any card to preview it (Add to cart is a disabled placeholder)
- Bottom tabs for **For Miller**, **Cart**, **Profile** are placeholder screens, ready for the next build pass

## Structure

```
App.js                        entry point, loads Fraunces/Public Sans/Baloo 2
src/theme/colors.js            brand colors + category icon/color map
src/data/mockData.js           resource catalogue (mirrors the prototype)
src/components/                PawIcon, ResourceCard, CategoryBadge, PriceTag, ScreenHeader
src/screens/                   HomeScreen, LibraryScreen, ResourceDetailScreen, PlaceholderScreen
src/navigation/RootNavigator.js  bottom tabs + stack for the detail screen
```

## Next steps (per the spec)

1. Build out **For Miller** (therapist resources + success stories tabs), **Cart**, **Profile**, and **Kid Mode** the same way Home/Library were built.
2. Wire up Supabase: auth, `resources` table, `purchases`, `therapist_resources`, `success_stories` (with row-level security scoped to the owning family).
3. Add Stripe checkout last, once the rest of the app works against real/mock data.

## Notes

- Dependency versions target **Expo SDK 57** (the current Expo Go release). If a newer SDK is out when you pull this down, `npx expo install --fix` will bump the pinned packages.
- The mock catalogue lives in `src/data/mockData.js` — edit titles/prices/categories there until Supabase is wired up.
