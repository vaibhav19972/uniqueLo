---
title: Catalog Spine
type: concept
updated: 2026-10-24
sources: [src/lib/data.ts, src/hooks/useCatalog.ts, src/data/mock-products.json, docs/11-data-model/README.md]
links: ["[[catalog-fallback-gate]]", "[[route-map]]", "[[mood-vibe-taxonomy]]", "[[cart-flow]]"]
---

# Catalog Spine

Every product/render the storefront shows passes through one pipeline:

`src/data/mock-products.json` (**3 SKUs / 25 variants** as of 2026-10-24, bundled)
→ `src/lib/data.ts` (`getProducts()` + adapter, snake_case → camelCase)
→ TanStack Query hooks in `src/hooks/useCatalog.ts` (`useProducts()`,
`useProduct()`, `useCategories()`, `useUniverses()`)
→ components / pages.

## Why it matters

- This spine is the **only** sanctioned data path — `docs/README.md` engineering rules
  forbid direct JSON imports inside components. Anything bypassing `data.ts` is a bug.
- The 3/25 counts are the storefront truth (re-verified 2026-10-24 by running the
  counter). Earlier revisions of this page claimed 14/73 and then 13/121; both were
  stale. If you touch the catalog, re-run the count rather than trusting this page.
- **The database and this JSON are no longer two truths.** `backend/production-seed.sql`
  is generated from this file by `backend/scripts/gen-seed.mjs`, and
  `npm run seed:check` fails when the committed seed is stale. The seed used to be
  hand-maintained, carried 2 of 13 products, and priced the hoodie at ₹8,990 against
  a catalog price of ₹3,499 — undetected because nobody diffs 121 variants by eye.
- Craft metadata attaches per product row through `embroidery_details`: technique,
  artisan hours, thread composition, macro media. **Region and artisan-guild are not
  product fields.** They were removed on 2026-10-24 as invented data; a named
  workshop is now a `suppliers` row linked via `product_suppliers`, carrying a GSTIN
  and a `verified_at` date.

## Trust fields (added 2026-10-24)

Every product carries `countryOfOrigin`, `codAvailable` and `returnWindowDays`, and
optionally `deliveryDaysMin/Max`, `weightGrams`, `hsnCode`, `sizeChart`. These are
what a ₹699–3,999 tier-2/3 buyer checks first, and `gen-seed.mjs` refuses to emit a
seed product missing them. See `docs/11-data-model`.

## Known open gap

None on the data path. The `is_mock` guard described in earlier revisions of this
page (and in `audit.md`) cannot be reproduced: **`schema.sql` has no `is_mock`
column**, and the fabricated rows it was meant to filter are no longer seeded.

## Changelog
- 2026-10-24 — counts corrected to 3/25; removed the false `moods[]` claim (0 of 3
  products carry `moods` or `vibes`, and no such column exists in the schema);
  documented the generated seed and the trust fields; retired the `is_mock` gap.
- 2026-10-12 — created from the 2026-10-12 audit; the counts recorded then (14/73)
  were already wrong.
