---
title: Legacy Catalog Frozen
type: decision
updated: 2026-10-12
sources: [src/data/products.json (deprecated-retained, 13 SKUs / 45 variants), supabase/seed.sql (seeds 13 legacy slugs, is_mock = false), docs/03-data-contracts/README.md §2, audit.md reconciliation]
links: ["[[catalog-fallback-gate]]", "[[catalog-spine]]", "[[is-mock-guard-gap]]"]
---

# Legacy Catalog Frozen

`src/data/products.json` (13 SKUs / 45 variants, verified 2026-10-12) and the legacy
13-product row set in `supabase/seed.sql` are **deprecated-retained**:

- **Never imported** in `src/` — verified via grep in the 2026-10-11 reconciliation.
- `seed.sql` still seeds it (all 13 slugs present, verified 2026-10-12), now with
  universe-schema columns and `is_mock = false`.
- **Do not add products there.** The storefront will never render them — with one
  exception: the [[is-mock-guard-gap]] means a Supabase-backed deploy would serve
  these legacy rows today. That's the bug, not the design.

## Why keep the files

- `products.json` documents the original atelier line and its craft metadata shape
  (technique unions, provenance fields) — reference for real-SKU Supabase data entry.
- The legacy seed exercises the full SQL path (RLS, orders, reviews) for the
  `/admin` Catalog Studio.

## Correct catalog identity

14 SKUs / 73 variants in `mock-products.json` = storefront truth. 13/45 legacy =
frozen reference. Any doc claiming 13 for storefront is stale.

## Changelog
- 2026-10-12 — created; counts re-verified by script, seed 13/13.