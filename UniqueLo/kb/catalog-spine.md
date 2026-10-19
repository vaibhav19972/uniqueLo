---
title: Catalog Spine
type: concept
updated: 2026-10-12
sources: [src/lib/data.ts, src/hooks/useCatalog.ts, docs/03-data-contracts/README.md]
links: ["[[catalog-fallback-gate]]", "[[route-map]]", "[[mood-vibe-taxonomy]]", "[[cart-flow]]"]
---

# Catalog Spine

Every product/render the storefront shows passes through one pipeline:

`src/data/mock-products.json` (14 SKUs / 73 variants, bundled)
→ `src/lib/data.ts` (`getProducts()` + adapter, snake_case → camelCase)
→ TanStack Query hooks in `src/hooks/useCatalog.ts` (`useProducts()`,
`useProduct()`, `useCategories()`, `useUniverses()`)
→ components / pages.

## Why it matters

- This spine is the **only** sanctioned data path — `docs/README.md` engineering rules
  forbid direct JSON imports inside components. Anything bypassing `data.ts` is a bug.
- The 14/73 counts (verified 2026-10-12) are the storefront truth. Never add products to
  the frozen legacy file — see [[legacy-catalog-frozen]].
- `mock-products.json` also carries `moods[]` on all 14 SKUs (verified 2026-10-12,
  14/14 covered) — see [[mood-vibe-taxonomy]].
- Craft metadata attaches per product row: technique, artisan hours, region, thread
  composition — the "luxury embroidery" provenance layer.

## Known open gap

The Supabase branch of `getProducts()` selects `is_mock` but does not filter on it —
`[[is-mock-guard-gap]]`.

## Changelog
- 2026-10-12 — created from the 2026-10-12 audit; counts re-verified (14/73 via script).