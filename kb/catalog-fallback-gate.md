---
title: Catalog Fallback Gate
type: mechanism
updated: 2026-10-12
sources: [src/lib/data.ts, docs/07-backend/README.md]
links: ["[[catalog-spine]]", "[[is-mock-guard-gap]]", "[[legacy-catalog-frozen]]"]
---

# Catalog Fallback Gate

`getProducts()` in `src/lib/data.ts` resolves the served catalog through a gate:

1. **Supabase configured + reachable + rows** → map rows through the adapter.
2. **Rows predate the universe schema** (feature detection: no `universe_slug` key on
   row 0) → log + serve the **bundled mock catalog** instead. Pre-migration rows carry
   no universe/gender/vibes and would poison universe-driven storefront UI.
3. **Supabase unset/error/empty** → mock catalog.

## The sharp edge

Step 1 currently has **no second filter** — any row that *carries* `universe_slug`
passes feature detection, including the 13 legacy rows seeded by the migrated
`supabase/seed.sql`. Those rows are legacy-atelier products with no universe
storefront meaning, and docs/08 §03-2c says storefront = mock SKUs only.
That's the [[is-mock-guard-gap]] — the intended fix is `.eq('is_mock', true)`
(legacy seed marks `is_mock = false`).

## Why this exists at all

Vercel/preview deploys run without `VITE_SUPABASE_*` keys → the bundled mock catalog
is what the live site actually renders today. Supabase is the post-launch real-SKU
path, not the current one.

## Changelog
- 2026-10-12 — created; verified in source lines 305–360 of `src/lib/data.ts`.