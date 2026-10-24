# 07 — Backend & Cloud Architecture (Supabase + Vercel)

> **Source of truth for the UniqueLo backend and database architecture.**
> Immediate deployment on **Vercel** (SPA edge CDN) paired with **Supabase**
> (managed PostgreSQL with Row Level Security, auth, realtime, and storage),
> backed by multi-stage Docker containers for real production servers.
> All data querying lives behind `src/lib/supabase.ts` and `src/lib/data.ts`
> with zero-config bundled fallback.

> **Historical note (2026-10-11):** Phases 8–9 were originally planned around
> Strapi v5 (Article CMS, Editor role, `/journal` routes). That plan was
> **superseded** by the Supabase-first stack below. No Strapi instance, Article
> collection, or Journal CMS exists in the codebase; the Footer currently links
> "Journal" → `/shop` as a placeholder until a Journal phase is scheduled.

---

## 1. Decision record

**Chosen: Supabase (Managed Postgres + RLS) + Vercel Edge SPA.**

| Requirement | How Supabase + Vercel covers it |
|---|---|
| Immediate cloud deployment | Vercel provides instant zero-config preview & production deployments with SPA routing (`vercel.json`) |
| Relational data model | Full PostgreSQL schema (`backend/schema.sql`) for products, variants, craft taxonomy, reviews, and orders |
| Role-Based Security & Permissions | PostgreSQL Row Level Security (RLS) policies enforce public read access and secured admin/order writes |
| Fast catalog browsing & fail-safe | Frontend queries Supabase via `@supabase/supabase-js`, falling back seamlessly to bundled JSON (`src/data/mock-products.json`) if keys are unset, rows predate the universe schema, or legacy mock rows would leak (the `is_mock` column does not exist in `schema.sql`; the guard described in `audit.md` cannot be reproduced as written — see `docs/11-data-model`). Localhost can force the JSON path for READS via `VITE_DATA_SOURCE=local` (writes stay live) |
| Inventory & Variant Tracking | `variants` table (keyed by `sku`, linked via `product_slug`) tracks size, colorway, cents price, quantity, and stock status |
| Craft Provenance & Macro Media | `embroidery_details` stores artisan hours, stitch types, thread composition and macro media. Region/guild-cluster are **not** free-text product fields — they are `suppliers` rows linked via `product_suppliers`, so a named workshop has a GSTIN and a `verified_at` date |
| Production Server Containerization | Multi-stage `Dockerfile` with optimized Alpine Nginx reverse proxy + `docker-compose.prod.yml` |

---

## 2. Architecture

```
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│  Storefront (Vercel Edge CDN)   │           │  Supabase Cloud (PostgreSQL 16)      │
│  React 19 + TypeScript + Vite   │   HTTPS   │  Tables: categories, products,       │
│  TanStack Query caching layer   │◄─────────►│  variants, product_images,           │
│  Zustand (Cart, Customizer, UI) │  REST/SQL │  embroidery_details, reviews,        │
│  Failsafe: bundled JSON fallback│           │  newsletter_subscribers, orders      │
└─────────────────────────────────┘           │  Security: Row Level Security (RLS)  │
                 │                            └──────────────────────────────────────┘
                 ▼                                        ▼
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│  Self-Hosted Linux / Docker     │           │  Storage & Edge                      │
│  Multi-stage Dockerfile         │           │  Supabase Storage Bucket:            │
│  Nginx 1.25 Alpine reverse proxy│          │  `product-images` (public reads)      │
└─────────────────────────────────┘           └──────────────────────────────────────┘
```

- **Environment Configuration:**
  - `VITE_SUPABASE_URL`: Supabase project URL (`https://your-project.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY`: Safe public anon JWT key
  - `VITE_DATA_SOURCE=local`: forces catalog READS (products, categories,
    reviews) from bundled `src/data/*.json` even when keys are set.
    Recommended for localhost (set in `.env.local`): the storefront tests
    against local data while Admin keeps its live client for uploads. Writes
    (review submit, newsletter, orders, storage) always use the live client
    when configured — they are not gated by this flag.
  - Fallback mode: If environment variables are empty, Supabase is unreachable, or the seeded rows predate the universe schema (feature detection on `universe_slug`), the store operates without error using local static JSON (`mock-products.json`). Rows coming from the generated seed pass feature detection by design: they carry `universe_slug` because they are the real catalog. There is no `is_mock` distinction to make any more — the fabricated/legacy rows are gone, and the seed is regenerated from the catalog rather than hand-maintained.

---

## 3. Database Schema (`backend/schema.sql`)

Catalog tables are **slug/sku-keyed** (no surrogate uuid ids on catalog rows);
uuid primary keys are used only for append-only rows (reviews, orders, images).
Snake_case columns map 1:1 to the camelCase TypeScript types via the adapter in
`src/lib/data.ts` (`getProducts()`).

### `categories`
`slug` (text, PK), `name`, `label`, `description`, `image`, `order_num` (int), `created_at`.

### `products`
`slug` (text, PK), `name`, `subtitle`, `description`, `category_slug` (FK → categories.slug), `tags` (text[]), `featured` (bool), `customizable` (bool), `material` (text[]), `care` (text[]), `fit`, `fabric_gsm`, `created_at`, plus the taxonomy and trust columns below.

**Retired 2026-10-24** by `migrations/20261024_data_model_trust_fields.sql`:
`craft_region`, `craft_cluster` (invented provenance — see
[docs/11](../11-data-model/README.md)), `batch_number`, `batch_total`,
`expression_slug` (a 1:1 rename of `expression_score`), `sold_count`. `craftCluster`
returns as a real FK to `product_suppliers` once the named collectives are
confirmed as actual vendors.

**Trust & disclosure** — the fields a ₹699–3,999 India-first buyer checks before
adding to bag:
`country_of_origin` (char(2) ISO-3166-1, default `IN`, check `^[A-Z]{2}$`) —
legally required, and distinct from craft tradition; `manufacturer_name`,
`manufacturer_address`, `packed_by` (Legal Metrology); `cod_available` (bool,
no default, so every SKU must state its policy); `delivery_days_min` /
`delivery_days_max` (smallint, max ≥ min); `return_window_days` (smallint, `0` =
non-returnable, the honest value for personalised pieces); `weight_grams`;
`hsn_code` (check `^[0-9]{4,8}$`); `size_chart` (jsonb).

### `suppliers` / `product_suppliers`
Real manufacturing partners: `slug`, `name`, `city`, `state`, `country_code`,
`gstin` (format-checked), contact fields, `verified_at` (null until someone has
actually visited), `is_active`. Joined to products through `product_suppliers`
with a `role` of `manufacturer` / `embroiderer` / `packer` / `dyer`, because one
SKU can involve more than one workshop. RLS enabled, public read on active rows.

### `variants`
`sku` (text, PK), `product_slug` (FK → products.slug, cascade), `color`, `color_hex`, `size`, `price_cents` (int), `compare_at_price_cents` (int), `status` (check: `in-stock` | `low-stock` | `out-of-stock`), `quantity` (int), `created_at`.

### `product_images`
`id` (uuid, PK), `product_slug` (FK → products.slug), `src`, `alt`, `color`, `sort_order` (int).

### `embroidery_details`
`id` (uuid, PK), `product_slug` (FK → products.slug, unique), `technique`, `technique_label`, `artisan_hours` (int), `placement` (text[]), `thread_composition`, `motif_story`, `macro_image_src`, `macro_image_alt`.

### `reviews`
`id` (uuid, PK), `product_slug` (FK → products.slug), `author`, `rating` (int, check 1–5), `title`, `comment`, `verified` (bool), `created_at`.

### `newsletter_subscribers`
`id` (uuid, PK), `email` (text, unique), `subscribed_at`.

### `orders`
`id` (uuid, PK), `customer_name`, `customer_email`, `status` (default `confirmed`), `subtotal_cents`, `discount_cents`, `shipping_cents`, `total_cents`, `coupon_code`, `gift_note`, `shipping_address` (jsonb), `created_at`.

### `order_items`
`id` (uuid, PK), `order_id` (FK → orders.id, cascade), `product_slug`, `variant_sku`, `product_name`, `color`, `size`, `quantity`, `price_cents`, `customization` (jsonb).

> **Database Architecture & Evolution:**
> - `backend/schema.sql` is 100% pure DDL (tables, foreign keys, indexes, RLS policies, storage).
> - `backend/production-seed.sql` is **generated** by `backend/scripts/gen-seed.mjs` from
>   `web/src/data/mock-products.json`, and seeds the full Master Taxonomy plus the
>   current product set (3 products / 25 variants as of 2026-10-24). Never edit it by
>   hand — run `npm run seed:gen`, and `npm run seed:check` fails CI when it is stale.
> - `backend/seed.sql` is **stale and cannot run**: it references `is_mock`, `vibes`
>   and `moods`, none of which `schema.sql` defines. It is not a 13-product dev seed
>   (it seeds 0 rows) and should be deleted or regenerated.
> - For managing live database updates, adding new tables, or altering columns in production, refer to the [Database Migration Guide](../DATABASE_MIGRATION_GUIDE.md).

---

## 4. Admin — Supabase Product Catalog Studio (`/admin`)

`src/pages/Admin.tsx` is a single-page catalog studio (no Strapi, no external CMS):

- Variant matrix editor (sizes × colorways with price, quantity, status).
- SQL + JSON generators that emit `INSERT` statements / seed JSON for the schema above.
- Image upload to the Supabase Storage bucket **`product-images`** (public reads); the admin's SQL tab includes the `storage.buckets` creation + public-read policy statements.
- Craft/region/cluster/GSM provenance fields per product.

`/admin` is gated by `AdminAuthGate` (`Admin.tsx`), which reads `supabase.auth.getSession()` and subscribes to `onAuthStateChange`. Shipped — this previously read "planned for Phase 9".

---

## 5. Security & Permissions (PostgreSQL RLS)

Supabase applies fine-grained Row Level Security (RLS) on each table:

| Table | RLS Policy | Access Scope |
|---|---|---|
| `categories` | Public SELECT | All visitors can browse active categories |
| `products` | Public SELECT | All visitors can browse active catalog garments |
| `variants` | Public SELECT | Public inventory and size/color availability |
| `product_images` | Public SELECT | Public imagery |
| `embroidery_details` | Public SELECT | Public craft provenance and stitch details |
| `reviews` | Public SELECT + public INSERT | Visitors can read reviews and submit feedback |
| `newsletter_subscribers` | Public INSERT | Newsletter and dispatch lead capture |
| `orders` & `order_items` | Public INSERT | Customer order placement (checkout drawer) |

---

## 6. `data.ts` Migration Seam & Client Architecture

All database queries pass through `src/lib/supabase.ts` into `src/lib/data.ts`.
Components use TanStack Query hooks (`useProducts()`, `useProduct(slug)`, `useCategories()` in `src/hooks/useCatalog.ts`).

- **Fail-Safe Fallback:** If `VITE_SUPABASE_URL` is omitted, unreachable, or the catalog rows predate the universe schema, `src/lib/data.ts` falls back to bundled `src/data/mock-products.json` (3 curated products, 25 variants as of 2026-10-24; the old `products.json` was deleted 2026-10-12 as stale). Setting `VITE_DATA_SOURCE=local` forces this JSON path for READS unconditionally (localhost testing); writes are unaffected. The catalog is now generated into the seed by `backend/scripts/gen-seed.mjs`, so a database and a fresh checkout cannot disagree about what exists.
- **Image URL Resolution:** `resolveImageUrl()` supports both relative local assets (`/images/products/...`) and Supabase Storage URLs (`product-images` bucket).
- **Stock Status:** `variants.status` is stored explicitly in JSON/Supabase and is the badge source (`in-stock` / `low-stock` / `out-of-stock`) — there is no quantity→status derivation. `getDefaultVariant()` prefers `in-stock` → `low-stock` → non-`out-of-stock` (`src/lib/data.ts`). Cart operations additionally clamp to the live `quantity` value — cart clamping wins over the badge.

---

## 7. Phasing Alignment (extends docs/05-phases)

| Phase | Delivers | Status |
|---|---|---|
| **Phase 7** | Async data layer, TanStack Query hooks (`useCatalog.ts`), React 19 compatibility | Completed |
| **Phase 8** | Supabase DDL schema (`schema.sql`), legacy seed dataset (`seed.sql`), Vercel SPA deploy config (`vercel.json`), Docker prod setup | Completed |
| **Phase 9** | Supabase Auth gating for `/admin`, Editor role policies, Stripe/Razorpay live webhooks, universe-schema migration (universes/motifs tables + product columns), Journal CMS (planned) | Next |