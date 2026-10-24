# 04 — Database runbook: make the backend match this code

> **Every command here was executed against a real Postgres 16.15 database and
> the expected output recorded.** Not a sketch. If your output differs, stop and
> read the note below that query.

## The one thing that matters

There are **three files, run in this exact order**. Order is not stylistic —
`schema.sql` creates the tables, the migration alters them, the seed fills them.
Running the seed first fails on missing columns.

```
1. backend/schema.sql                                       (13 tables, 39 RLS policies)
2. backend/migrations/20261024_data_model_trust_fields.sql  (44 columns, registry, trigger)
3. backend/production-seed.sql                              (3 products / 25 variants)
4. backend/migrations/20261025_admin_write_policies.sql     (REQUIRED — closes the catalog-write hole)
5. backend/migrations/20261026_publish_product.sql          (the panel's publish path)
6. backend/scripts/verify-db.sql                            (proves all of the above)
```

Step 4 is required, not optional: without it the catalog is world-writable and the
`anon` key that ships in the frontend bundle can delete every product. See the
security section at the bottom.

Step 5 installs `public.publish_product()`, which is how the Catalog Studio writes
products. Without it the panel's Publish button fails with *function does not
exist*. `production-seed.sql` does not need it — the seed inserts directly as the
database owner.

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

These are named "Allow admin …" but gate nothing.

**A `service_role`-only policy would break the admin panel.** `AdminAuthGate`
signs in with `supabase.auth.signInWithPassword` using the **anon key**, so its
requests arrive as `authenticated`, not `service_role`. Locking writes to
`service_role` makes the catalog read-only in the browser.

There is also a second gate problem: `AdminAuthGate` checks only that a session
**exists**, and `schema.sql` has no role table at all. Anyone able to create an
account can reach the UI. The app has no signup screen, but Supabase's signup
endpoint is still reachable with the public anon key unless disabled in
Authentication → Providers → Email.

**Fixed by `backend/migrations/20261025_admin_write_policies.sql`** — an
optional fourth file. It creates `public.is_admin()` (true for a row in
`public.admins`, or `app_metadata.role` of `admin`/`service_role`), a `public.admins`
table, and replaces 15 permissive policies with one `is_admin()`-gated policy per
table. `app_metadata` is used rather than `user_metadata` because users cannot
edit it themselves.

Measured with 8 tests against real Postgres, emulating Supabase's auth functions:

| Test | Result |
|---|---|
| anonymous delete | 1 row survives ✓ |
| logged-in non-admin delete | 1 row survives ✓ |
| non-admin with `app_metadata.role=authenticated` | 1 row survives ✓ |
| admin via `app_metadata.role=admin` | deletes successfully ✓ |
| admin via `public.admins` row | can insert ✓ |
| customer reads catalog | visible ✓ |
| anonymous self-promotes to admin | **blocked by RLS** ✓ |
| customer places an order | succeeds ✓ |

service_role bypasses RLS, so the seed and migrations are unaffected (re-seeded
successfully after applying). The migration is idempotent — ran it twice, still
2 policies on `products`.

**Before deploying:** create your admin user in Supabase Auth, then run

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'you@example.com';
```

and disable public signup in the Auth settings. Without a row in `public.admins`
and without `app_metadata.role`, the admin panel will authenticate but every
write will be refused.

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

---

## Publishing products from the panel

The Catalog Studio writes through `public.publish_product(p_product jsonb,
p_variants jsonb)`. This replaced an earlier design where the panel emitted SQL for
a human to paste into the Supabase SQL editor — that air gap existed because there
was no trusted write path, not because it was a good boundary. The panel had
already been writing `universes`, `categories`, `garments`, `collections` and
`motifs` directly, so products were the only table with a paste step.

**Why a function and not five `supabase.from()` calls.** A product is four tables:
`products`, `product_images`, `variants` and `embroidery_details`. PostgREST cannot
open a transaction across four requests, so a mid-way failure leaves a product with
no variants — which renders as a card with no price and cannot be bought. The
function body is one transaction, so a failure anywhere rolls back all four. This
is the same shape as `place_order()`, which the checkout already relies on.

**Security.** `security definer` with a pinned `search_path`, which bypasses RLS —
so the `is_admin()` check on the first line *is* the gate. It raises
`insufficient_privilege` rather than returning a soft error, so a caller without
rights cannot mistake a no-op for success. `execute` is granted to `authenticated`
only; `anon` is explicitly revoked, since the anon key is public.

**What it validates**, beyond the column types:

| Check | Why |
|---|---|
| `is_admin()` | Definer bypasses RLS; this is the only gate |
| slug is kebab-case | It is a URL and a foreign-key target, so a bad one propagates to every child row |
| ≥1 variant | A product with no variants has no price and cannot be bought |
| required attributes | Delegated to the `products` trigger, so the panel, the seed and a manual paste share one contract |
| barcode is 8–14 digits | The UNIQUE index would reject it, but with a constraint name, not a SKU |
| barcode not reused | Pre-checked so the message names the conflict |
| `country_of_origin` is ISO-2 | Otherwise `character(2)` raises a raw type error naming a column nobody typed into |

**Idempotent.** Upserts on `slug`, `sku` and `product_slug`, and images are
delete-then-inserted because `sort_order` is a semantic slot index — editing a
product from five images to three must not leave stale slots behind. Re-publishing
an edited product updates it in place.

**Verifying it without clicking through the UI.** The payload is built inside a
React component, so nothing typechecks it against the function. Render the real
object and execute it:

```bash
cd web && npm run publish:payload | head -c 200     # extracts buildPublishPayload()
```

`backend/scripts/render-publish-payload.mjs` pulls the actual object literal out of
`Admin.tsx`, substitutes the component's state, and refuses (non-zero exit) if the
payload is missing a key the RPC reads. It is wired into `npm run verify`. A rename
like `cod_available` → `codAvailable` is invisible to `tsc` and to the build; it
fails at runtime as "Publish Failed" in the operator's face.
