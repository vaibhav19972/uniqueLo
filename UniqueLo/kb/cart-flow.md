---
title: Cart Flow
type: mechanism
updated: 2026-10-12
sources: [src/stores/cart.ts, src/components/layout/CartDrawer.tsx, src/components/layout/CartLineItem.tsx, src/lib/data.ts (createOrder)]
links: ["[[audit-trail]]", "[[catalog-spine]]", "[[route-map]]"]
---

# Cart Flow

Cart lives in the Zustand store (`src/stores/cart.ts`) with stock clamping built in:

- `addItem` / `updateQuantity` take `maxQuantity` and **clamp** to available stock —
  permanent regression guard for BUG-4.
- Out-of-stock variants are rejected as additions from every entry point: PDP,
  `QuickViewModal`, `CartDrawer`.
- Checkout: `CartDrawer.tsx` opens a modal (UPI/COD/Card), calls `createOrder()`
  in `src/lib/data.ts` → `orders` + `order_items` tables (Supabase path).
- Per docs/03 the order payload prices in **paise** and customization is a jsonb blob
  fed by the customizer store.

## Gokwik-Style Cart Bag (Design System v2)

When `USE_THEME_V2 = true` in `src/config/theme.ts`, `CartDrawer.tsx` & `CartLineItem.tsx` activate the Gokwik-style checkout drawer matching `sketches/design system.png`:
- **Top Announcement Bar:** Black strip (`#111827`) with `⚡ Get 10% off with code HUSTLE10`.
- **Discount Milestone Bar:** Dynamic tier tracker (₹500 for 10% OFF + free shipping, ₹5,999 for 15% OFF, ₹9,999 for 20% OFF) with animated progress bar and remaining amount calculation.
- **In-Cart Variant Switching:** Size dropdown button (`[ M ⌄ ]`) in line items allows customers to switch garment sizes directly inside the drawer without removing and re-adding.
- **Pill Stepper:** Rounded `#f3f4f6` container with trash can delete icon when quantity is 1.
- **Coupon Drawer & Modal:** Dashed coupon card with quick-apply `HUSTLE10` button plus interactive modal listing 12 available platform promotions.
- **Curated Cross-Sell:** "You may also like..." add-on carousel with 1-click addition.
- **Floating Savings Ribbon:** Sticky emerald banner showing exact savings (`You are saving ₹X on this order!`).
- **Instant Checkout Bar:** High-contrast full-width button with total payable price, verification subtext, and payment partner badges (UPI, Cards, Netbanking, COD).

## Corner Radius Scope Rule
- **Cart Bag Only:** Rounded corners (`rounded-2xl`, `rounded-xl`, `rounded-full`) are strictly confined to the Cart Bag drawer (`CartDrawer.tsx` & `CartLineItem.tsx`).
- **Rest of Website:** Product cards, bestseller cards, home sections, PDP, and navigation maintain clean, crisp architectural square rectangles (`--radius-sm: 0.125rem`, `--radius-md: 0.25rem`).

## Test surface

This is the highest-risk surface for E2E (docs/10-testing T5.4/T5.5) because it
crosses store, component, modal, and network layers. Unit-level: T2.1/T2.2.

## Verified

- `createOrder` wired: `src/lib/data.ts` + only `CartDrawer.tsx` calls it (grep,
  2026-10-12).
- Clamping logic unchanged since BUG-4's fix (audit.md).
- Cart component path verified: `src/components/layout/CartLineItem.tsx`.

## Changelog
- 2026-10-19 — documented v2 Gokwik-style Cart Bag features, Corner Radius Scope Rule, and fixed CartLineItem file path.
- 2026-10-12 — created from source check.