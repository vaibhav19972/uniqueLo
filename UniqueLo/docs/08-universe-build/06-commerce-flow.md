# 06 — Commerce Flow

## Pricing rules

- All money: integer paise (`*_cents`). Display via `formatPrice` (`en-IN`, ₹, 0 decimals).
- `compare_at_price_cents` shown only if set in DB; never computed or invented.
- Constants (single source, mirrored in UI + seed): `FREE_SHIP_THRESHOLD = 2905000` paise (₹29,050) · `GIFT_THRESHOLD = 4980000` (₹49,800) · `STANDARD_SHIPPING = 199900` (₹1,999) · `NEEDLECRAFT_COUPON = 332000` (₹3,320).

## Cart rules

- Lines keyed by (product_slug, variant_sku, customization?). Qty clamps to `variants.quantity`; OOS lines blocked with message, never silent.
- Free-ship + gift progress bars derive from merch subtotal after discounts.
- Coupons: code lookup, single active coupon, visible error states (expired/invalid/min-not-met). Live codes (`CartDrawer.tsx`): `ATELIER10` → 10% off merch subtotal · `NEEDLECRAFT` → ₹3,320 off · `FREESHIP` → free shipping (also qualifies the free-ship progress bar).
- Upsells: real in-stock products only, excluded if already in bag, add capped at stock.

## Checkout (always neutral surface)

1. Validate name / email / address / pincode inline with visible errors; never silent return.
2. Payment method required: UPI · card · COD (`orders.payment_method`).
3. Submit writes `orders` (totals recomputed server-side-equivalent in `createOrder`, never trusted from client display) + `order_items` snapshots, decrements variant quantities.
4. Failure: preserve cart + inputs, show error, log. No partial orders (both writes succeed or neither is shown as success).
5. `payment_state`: UPI/card → `paid` on gateway confirm (stub until gateway wired — record `pending` + method, reconcile in admin); COD → `pending` until delivery.

## Bundles (Complete the Look)

- Universe pages show a curated set: featured hero + up to 3 same-universe companions of different garment types, all in-stock. Fewer than 2 qualifiers → band hidden, never empty.
- **Honesty rule:** the band shows the set total at unit prices. Add-All adds each default variant clamped to stock. No bundle discount is advertised until a real discount engine exists (P-future: cart-level bundle coupon with server-side recompute).

## Post-purchase

- Confirmation page: order id, ETA range by pincode, payment explanation, gift note echo.
- Reviews solicited post-delivery; `verified` only for purchased SKUs.
- Returns: 14-day home inspection; condition check; refund to source (COD → bank/UPI details collected).

## Decisions locked

1. Totals recomputed at order time; client display never authoritative.
2. Stock decremented on order; oversell impossible by construction (clamp + check).
3. Payment stub records method + pending state; gateway integration is a later phase, not this build.
