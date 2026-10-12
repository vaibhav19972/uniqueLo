# kb/index.md

| Page (all in `kb/`) | Type | One-line summary | Related |
|---|---|---|---|
| [[catalog-spine]] | concept | Data flows JSON/seed → `data.ts` adapter → TanStack Query hooks → components | [[catalog-fallback-gate]], [[route-map]] |
| [[catalog-fallback-gate]] | mechanism | Supabase → feature-detect `universe_slug` → mock fallback chain | [[catalog-spine]], [[is-mock-guard-gap]], [[legacy-catalog-frozen]] |
| [[is-mock-guard-gap]] | bug (open) | `getProducts()` lacks `.eq('is_mock', true)`; migrated seed leaks legacy rows to storefront | [[catalog-fallback-gate]], [[audit-trail]] |
| [[universe-theming]] | mechanism | `[data-universe]` on `<html>`, scoped token remaps, `data-u-zone` opt-out for neutral zones | [[mood-vibe-taxonomy]], [[route-map]] |
| [[mood-vibe-taxonomy]] | data | Two-axis discovery: vibes.json (7, aesthetic axis) × moods.json (6, buyer intent); gateway components | [[universe-theming]], [[catalog-spine]] |
| [[legacy-catalog-frozen]] | decision | `products.json` + 13-SKU legacy seed: deprecated-retained, never imported by `src/` | [[catalog-fallback-gate]], [[catalog-spine]] |
| [[cart-flow]] | mechanism | Stock-clamped cart → checkout → orders/order_items in Supabase | [[audit-trail]], [[catalog-spine]] |
| [[audit-trail]] | doc-map | What the past audits found, what's fixed, what's still tracked open | [[is-mock-guard-gap]], [[cart-flow]] |
| [[route-map]] | reference | 10 lazy routes with Suspense, what each renders | [[catalog-spine]], [[universe-theming]] |