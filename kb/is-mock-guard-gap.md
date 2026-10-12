---
title: is_mock Guard Gap
type: bug
status: open
updated: 2026-10-12
sources: [src/lib/data.ts (getProducts), supabase/seed.sql, docs/08-universe-build/03-data-model.md §2c, docs/07-backend/README.md §3]
links: ["[[catalog-fallback-gate]]", "[[audit-trail]]", "[[legacy-catalog-frozen]]"]
---

# is_mock Guard Gap (OPEN BUG)

`getProducts()` does not filter `is_mock = true`. The migrated seed
(`95b1f93`, 2026-10-11) seeds **legacy** 13-SKU rows with `is_mock = false`
and full universe columns — those rows **pass** the `universe_slug`
feature-detection gate and would be served to the storefront by a
Supabase-backed deploy. Intended behavior per docs/08 §03-2c: storefront
serves `is_mock = true` rows only.

## Repro (logic)

Any deploy with `VITE_SUPABASE_*` set + migrated seed applied →
`getProducts()` returns 13 legacy atelier products alongside/instead of the
mock line → PLP/PDP render legacy products with no universe theming fit.

## Fix

Add `.eq('is_mock', true)` to the products select in `src/lib/data.ts`.
Write the test red first (T1.4 in docs/10-testing) — feature-detection tests
already exist as a pattern there.

## Tracked in

- `audit.md` — "Code fix needed before mock-phase deploys against a seeded DB."
- `docs/03` + `docs/07` — carry the caution note (uncommitted as of 2026-10-12).

## Changelog
- 2026-10-11 — surfaced by docs↔code reconciliation; doc-side notes written.
- 2026-10-12 — confirmed still open (grep: `is_mock` appears in the select list, no
  `.eq('is_mock', …)` anywhere in `getProducts()`). Not fixed today.