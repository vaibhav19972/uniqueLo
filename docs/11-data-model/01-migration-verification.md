# 01 — Migration: data model trust fields — verification record

Run date: **2026-10-24**. Postgres **16.15** (Homebrew), throwaway cluster on
port 55432. Not Supabase, so `storage.*` objects are absent — the three
`ERROR: schema "storage" does not exist` lines from `schema.sql` are expected and
unrelated to this migration.

**Nothing here was verified against the production Supabase instance.** It was
verified against the committed `schema.sql` in a clean database.

## What the migration does

`backend/migrations/20261024_data_model_trust_fields.sql`, in five parts:

| Part | Change |
|---|---|
| A | Drops 6 columns: `craft_cluster`, `craft_region`, `batch_number`, `batch_total`, `expression_slug`, `sold_count` |
| B | Adds `country_of_origin` (ISO-2, default `IN`), `manufacturer_name`, `manufacturer_address`, `packed_by` |
| C | Adds `cod_available`, `delivery_days_min/max`, `return_window_days`, `weight_grams`, `hsn_code`, `size_chart` |
| D | Creates `suppliers` + `product_suppliers` with RLS and two read policies |
| E | Adds a trigger refusing hand-edits of `rating` / `review_count` |

Product columns: **31 → 36**.

## Result

```
schema.sql            → 13 tables (3 storage.* errors, expected)
migration             → exit 0
production-seed.sql   → 2 products, 8 variants
```

## Constraint tests — 7 negatives, 5 positives, all correct

Bad data refused:

| Case | Result |
|---|---|
| `country_of_origin = 'INDIA'` | rejected — value too long for `char(2)` |
| `country_of_origin = 'in'` | rejected — CHECK `^[A-Z]{2}$` |
| `hsn_code = 'abc'` | rejected — CHECK `^[0-9]{4,8}$` |
| `hsn_code = '12'` (too short) | rejected |
| `weight_grams = -5` | rejected |
| `delivery_days_min=7, max=3` | rejected — max < min |
| `return_window_days = -1` | rejected |
| supplier `gstin = 'NOTAGSTIN'` | rejected — GSTIN pattern |

Valid data accepted: `country IN / hsn 6109 / weight 250`, delivery `5..7`,
delivery both null, `return_window 7`, `cod_available true`, valid GSTIN
`27AAPFU0939F1ZV`.

## Rating-cache guard — both directions

```
update products set rating=4.9;                              → REFUSED
                                 ("derived from public.reviews; set
                                   app.rating_cache_update=on")
set app.rating_cache_update='on'; update products set rating=4.9; → ALLOWED
```

So hand-authored social proof is blocked, and the aggregation job still works.

## The six dropped columns are unwritable

All six return `column ... does not exist` on insert. Verified individually.

## Bugs this test caught in my own work

1. **The migration alone breaks the seed.** `production-seed.sql` inserted into
   all six dropped columns and its own `ALTER TABLE ... ADD COLUMN
   IF NOT EXISTS` block would have resurrected `expression_slug` and
   `sold_count`. Fixed in the same change set: 30 → 24 product columns in both
   `INSERT` blocks, their `VALUES` tuples, and both `ON CONFLICT ... DO UPDATE
   SET` lists.
2. **First rewrite destroyed the `INSERT` headers** (`INSERT INTO public.products (`
   deleted, leaving bare column lists). Caught by re-running the seed and seeing
   `syntax error at or near "slug"`; restored from git and redone with a
   preview-before-write pass.
3. **A regex `;\n` finder swallowed the `ON CONFLICT` clause**, so the first
   pass rewrote tuples against the wrong segment. Fixed by locating
   `ON CONFLICT` explicitly.

All three were found by executing, not by reading. None shipped.

## Pre-existing breakage found, NOT fixed here

`backend/seed.sql` **does not run against `schema.sql`, with or without this
migration.** Verified on a schema-only database with no migration applied:

```
ERROR: column "is_mock" of relation "products" does not exist
ERROR: insert ... violates foreign key constraint "product_images_product_slug_fkey"
→ 0 products seeded
```

It references three columns `schema.sql` has never defined:

| Column | `seed.sql` refs | `schema.sql` |
|---|---|---|
| `is_mock` | 27 | 0 |
| `vibes` | 26 | 0 |
| `moods` | 26 | 0 |

This is unrelated to the migration and is left alone — it is stale legacy file
territory. Note it also means the `is_mock` guard recorded in `audit.md` (the open
`getProducts()` bug) refers to a column the current schema does not have, which
undercuts how that bug was described.

## Still required before this is real

The migration is schema-only. Four follow-ups, in order:

1. **Data migration** for existing rows: nothing to preserve from the six dropped
   columns (they were fabricated), but `country_of_origin`, `cod_available`,
   `return_window_days` and `delivery_days_*` need real values per SKU. All
   currently default (`IN`, `false`, `0`, null).
2. **`src/lib/data.ts`** still selects the dropped columns in its `.select()`
   string (line ~473). It will error at runtime once the migration is applied.
   This is the immediate blocker for deploying the schema change.
3. **`mock-products.json`** still carries all six dropped keys; nothing reads
   them after data.ts is updated, so removal is cleanup, not a blocker.
4. **Mobile app** renders `craftCluster` in 8 places and `craftRegion` in 6. The
   migration removes the source of truth; the app will show blanks until those
   surfaces are redesigned around real supplier data.
