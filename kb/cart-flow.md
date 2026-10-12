---
title: Cart Flow
type: mechanism
updated: 2026-10-12
sources: [src/stores/cart.ts, src/components/layout/CartDrawer.tsx, src/components/shop/CartLineItem.tsx, src/lib/data.ts (createOrder)]
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

## Test surface

This is the highest-risk surface for E2E (docs/10-testing T5.4/T5.5) because it
crosses store, component, modal, and network layers. Unit-level: T2.1/T2.2.

## Verified

- `createOrder` wired: `src/lib/data.ts` + only `CartDrawer.tsx` calls it (grep,
  2026-10-12).
- Clamping logic unchanged since BUG-4's fix (audit.md).

## Changelog
- 2026-10-12 — created from source check.