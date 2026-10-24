# 04 — Database runbook: make the backend match this code

> **Every command here was executed against a real Postgres 16.15 database and
> the expected output recorded.** Not a sketch. If your output differs, stop and
> read the note below that query.

## The one thing that matters

There are **three files, run in this exact order**. Order is not stylistic —
`schema.sql` creates the tables, the migration alters them, the seed fills them.
Running the seed first fails on missing columns.

```
1. backend/schema.sql                                    (13 tables, 39 RLS policies)
2. backend/migrations/20261024_data_model_trust_fields.sql  (44 columns, registry, trigger)
3. backend/production-seed.sql                           (3 products / 25 variants)
```

`production-seed.sql` is **generated**. Never hand-edit it — run
`node backend/scripts/gen-seed.mjs` and let it rewrite the file from
`web/src/data/mock-products.json`.

---

## Option A — fresh Supabase (you are dropping the DB)

### 1. Create a new database
In the Supabase dashboard: create the project, or reset the existing one.
Get: **Project URL**, **anon key**, **service_role key**, and the **direct
connection string** (Settings → Database → Connection string → URI). Use the
**direct** or **session pooler** connection for DDL, not the transaction pooler —
the pooler cannot run some of these statements.

### 2. Run the schema
Open the SQL Editor, paste `backend/schema.sql`, run.

> **Expected:** no errors. Outside Supabase you will see `schema "storage" does
> not exist` — that is normal, `storage` is a Supabase-managed schema. Inside
> Supabase it will not appear.

### 3. Run the migration
Paste `backend/migrations/20261024_data_model_trust_fields.sql`, run.

> **Expected:** no errors. Drops 6 columns, adds 20, creates
> `attribute_definitions` (14 rows), adds the attribute-validation trigger.

### 4. Run the seed
Paste `backend/production-seed.sql`, run.

> **Expected:** no errors. Inserts 3 universes, 6 categories, 9 garments,
> 3 collections, 7 motifs, 3 products, 25 variants, 25 barcodes, 10 images,
> 3 embroidery specs.

### 5. Verify
Paste `backend/scripts/verify-db.sql`, run. It prints 10 checks with expected
values in the comments. **Do not skip this** — it is the difference between
"the SQL didn't error" and "the database matches the code."

Expected result, actual measured output:

| # | Check | Expected |
|---|---|---|
| 1 | product columns | **44** |
| 2 | dropped columns present | **0** |
| 3 | trust + marketplace columns | **14** |
| 4 | universes / categories / garments / collections / motifs / products / variants / attribute_definitions | **3 / 6 / 9 / 3 / 7 / 3 / 25 / 14** |
| 5 | variants missing a barcode | **0** |
| 6 | cod_available / return_window_days | **true / 7** on all rows |
| 7 | attributes per garment | 10 per hoodie, 5 for the scarf |
| 8 | RLS on attribute_definitions | **t** |
| 9 | `products_validate_attributes` trigger | **1** |
| 10 | products with NULL style_code | **0** |

### 6. Point the frontend at it
`web/.env.local`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Then `npm run dev`. The storefront reads Supabase when those are present and
falls back to the bundled JSON when they are not — so **an empty or wrong URL
silently serves the mock catalog**, which looks like success. Confirm the badge/
network call actually hits Supabase.

---

## Option B — drop and recreate only the app tables

If the project and its auth users must stay, run this instead of deleting the
project. It removes only what `schema.sql` owns.

```sql
-- DESTRUCTIVE. Everything below is app data.
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.reviews cascade;
drop table if exists public.newsletter_subscribers cascade;
drop table if exists public.product_images cascade;
drop table if exists public.embroidery_details cascade;
drop table if exists public.variants cascade;
drop table if exists public.products cascade;
drop table if exists public.collections cascade;
drop table if exists public.garments cascade;
drop table if exists public.categories cascade;
drop table if exists public.motifs cascade;
drop table if exists public.universes cascade;
drop table if exists public.attribute_definitions cascade;
drop function if exists public.products_validate_attributes() cascade;
drop function if exists public.products_guard_rating_cache() cascade;
```

Then Option A steps 2–5.

**Caveat:** this does not touch `auth.users`. If orders survive a
`service_role`-linked auth table, you will have order rows pointing at user ids
that no longer have a matching product. Since you are dropping anyway, prefer
Option A.

---

## Option C — CLI, from the machine

```bash
export PATH=/opt/homebrew/bin:$PATH
export DBURL='postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres'

psql "$DBURL" -v ON_ERROR_STOP=1 -f backend/schema.sql
psql "$DBURL" -v ON_ERROR_STOP=1 -f backend/migrations/20261024_data_model_trust_fields.sql
psql "$DBURL" -v ON_ERROR_STOP=1 -f backend/production-seed.sql
psql "$DBURL" -f backend/scripts/verify-db.sql
```

`-v ON_ERROR_STOP=1` matters: without it psql keeps going after a failure and you
get a half-built database that looks populated.

---

## Re-running is safe

Both the migration and the seed are idempotent — measured, not assumed:

- Migration re-run on an already-migrated database: **no errors**, no changes.
  Every `add column` is `if not exists`, every `drop` is `if exists`, the
  registry insert is `on conflict (key) do update`, the trigger is
  `drop ... if exists` then `create`.
- Seed re-run: **still 3 products / 25 variants / 14 attribute defs** — no
  duplicates. Products upsert `on conflict (slug) do update`; child rows
  (`variants`, `product_images`, `embroidery_details`) are deleted per product
  then re-inserted.

So a failed run can simply be re-run after fixing the cause.

---

## What each file does to `products`

Starting schema had **31 columns**.

**Dropped (6)** — all verified absent afterwards:
`craft_region`, `craft_cluster`, `batch_number`, `batch_total`,
`expression_slug`, `sold_count`

**Added (13 + registry)** — verified present:
`country_of_origin`, `manufacturer_name`, `manufacturer_address`, `packed_by`,
`cod_available`, `delivery_days_min`, `delivery_days_max`, `return_window_days`,
`weight_grams`, `hsn_code`, `size_chart`, `style_code`, `attributes`
plus `fit_notes`, `model_height_cm`, `model_worn_size`,
`package_length_mm`, `package_width_mm`, `package_height_mm`

Result: **44 columns** in `products`, plus `attribute_definitions` (14 rows) and
`variants.barcode`.

---

## 🔴 Two security problems you must fix before this database goes public

Both were found by testing as an anonymous role, not by reading the code.

### 1. Anyone can delete the entire catalog (pre-existing)

`schema.sql` contains:

```sql
create policy "Allow admin insert products" on public.products for insert with check (true);
create policy "Allow admin update products" on public.products for update using (true);
create policy "Allow admin delete products" on public.products for delete using (true);
```

`using (true)` grants **every row** to **every caller**. The `anon` key ships
inside the frontend bundle — it is public by design. Measured consequence: an
anonymous role ran `delete from products` and the catalog went from **3 rows to
0**. The same applies to `variants`, `product_images`, `embroidery_details`,
`collections`, and the other admin write policies.

These are named "Allow admin …" but gate nothing. The fix is to replace
`using (true)` with a real role check, e.g.:

```sql
drop policy "Allow admin insert products" on public.products;
create policy "Admin write products" on public.products for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');
```

**Not applied yet** — this changes admin behaviour and is your decision. Options:
`service_role` JWT check (simplest), a `profiles.role = 'admin'` table, or
Supabase custom claims. The admin UI must keep working either way.

### 2. The attribute registry was writable anonymously (fixed)

`attribute_definitions` did not exist before this migration, so it was not in the
hardcoded RLS block in `schema.sql`. Without RLS, Supabase's default public-schema
grants let an anon key edit the attribute contract itself. **Fixed** in the
migration: RLS enabled, public `select` only, writes closed. Verified — an
anonymous role deleted nothing.

Recommended follow-up: change `schema.sql`'s RLS block to a loop over
`pg_tables` so a newly added table can never be forgotten again.

---

## Known gaps in this runbook

- **Storage bucket policies** (`storage.objects`) only work inside Supabase. On a
  plain Postgres they error, and the product images they govern are remote URLs
  for now, so nothing depends on them yet.
- **`seed.sql` is not part of this runbook.** It is stale and cannot run — it
  references `is_mock`, `vibes` and `moods`, none of which `schema.sql` defines.
  It only ever seeded 0 rows. Delete it or regenerate it from `gen-seed.mjs`.
- **Nothing was run against your production Supabase.** All of the above was
  verified on a local Postgres 16.15 cluster with the real files.
