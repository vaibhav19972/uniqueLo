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
| Relational data model | Full PostgreSQL schema (`supabase/schema.sql`) for products, variants, craft taxonomy, reviews, and orders |
| Role-Based Security & Permissions | PostgreSQL Row Level Security (RLS) policies enforce public read access and secured admin/order writes |
| Fast catalog browsing & fail-safe | Frontend queries Supabase via `@supabase/supabase-js`, falling back to bundled JSON (`src/data/mock-products.json`) if keys are unset, rows predate the universe schema, or legacy mock rows would leak (no `is_mock` filter yet — see §3) |
| Inventory & Variant Tracking | `variants` table (keyed by `sku`, linked via `product_slug`) tracks size, colorway, cents price, quantity, and stock status |
| Craft Provenance & Macro Media | `embroidery_details` table stores artisan hours, guild clusters, regions, stitch types, and thread compositions |
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
  - Fallback mode: If environment variables are empty, Supabase is unreachable, or the seeded rows predate the universe schema (feature detection on `universe_slug`), the store operates without error using local static JSON (`mock-products.json`). Note: rows seeded with the migrated schema DO pass detection — `is_mock` filtering is still pending (§3), so the migrated legacy seed would be served until that guard lands.

---

## 3. Database Schema (`supabase/schema.sql`)

Catalog tables are **slug/sku-keyed** (no surrogate uuid ids on catalog rows);
uuid primary keys are used only for append-only rows (reviews, orders, images).
Snake_case columns map 1:1 to the camelCase TypeScript types via the adapter in
`src/lib/data.ts` (`getProducts()`).

### `categories`
`slug` (text, PK), `name`, `label`, `description`, `image`, `order_num` (int), `created_at`.

### `products`
`slug` (text, PK), `name`, `subtitle`, `description`, `category_slug` (FK → categories.slug), `tags` (text[]), `featured` (bool), `customizable` (bool), `material` (text[]), `care` (text[]), `fit`, `batch_number` (int), `batch_total` (int), `craft_region`, `craft_cluster`, `fabric_gsm`, `created_at`.

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

> **Migration status (2026-10-11):** the universe schema has **landed** —
> `universes` / `motifs` tables and the `products.universe_slug / garment_type /
> gender / vibes / moods / motif_id / is_mock / handcrafted / foreign_tagline …`
> columns are in `schema.sql`, with universe/motif assignments in `seed.sql`.
> `seed.sql` still seeds only the 13-product legacy atelier line
> (`is_mock = false`); the 14 mock SKUs remain bundled-only
> (`src/data/mock-products.json`). The storefront feature-detects the schema
> shape, but **does not yet filter `is_mock`** — so after running the migrated
> `seed.sql`, the legacy 13 rows WILL be served to the storefront (they now
> carry `universe_slug` and pass feature detection). Per docs/08 §03-2c the
> planned behavior is `is_mock = true` filtering; `getProducts()` needs that
> `.eq()` guard before the migrated seed is safe to apply in a mock-phase deploy.

---

## 4. Admin — Supabase Product Catalog Studio (`/admin`)

`src/pages/Admin.tsx` is a single-page catalog studio (no Strapi, no external CMS):

- Variant matrix editor (sizes × colorways with price, quantity, status).
- SQL + JSON generators that emit `INSERT` statements / seed JSON for the schema above.
- Image upload to the Supabase Storage bucket **`product-images`** (public reads); the admin's SQL tab includes the `storage.buckets` creation + public-read policy statements.
- Craft/region/cluster/GSM provenance fields per product.

Auth gating of `/admin` is planned for Phase 9 (Supabase Auth + role policies); today the route is open in dev.

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

- **Fail-Safe Fallback:** If `VITE_SUPABASE_URL` is omitted, unreachable, or the catalog rows predate the universe schema, `src/lib/data.ts` falls back to bundled `src/data/mock-products.json` (14 render-mock SKUs; `products.json` is deprecated-retained and no longer imported). Migrated-seed legacy rows still pass feature detection until the `is_mock` filter lands — see §3.
- **Image URL Resolution:** `resolveImageUrl()` supports both relative local assets (`/images/products/...`) and Supabase Storage URLs (`product-images` bucket).
- **Stock Status:** `variants.status` is stored explicitly in JSON/Supabase and is the badge source (`in-stock` / `low-stock` / `out-of-stock`) — there is no quantity→status derivation. `getDefaultVariant()` prefers `in-stock` → `low-stock` → non-`out-of-stock` (`src/lib/data.ts`). Cart operations additionally clamp to the live `quantity` value — cart clamping wins over the badge.

---

## 7. Phasing Alignment (extends docs/05-phases)

| Phase | Delivers | Status |
|---|---|---|
| **Phase 7** | Async data layer, TanStack Query hooks (`useCatalog.ts`), React 19 compatibility | Completed |
| **Phase 8** | Supabase DDL schema (`schema.sql`), legacy seed dataset (`seed.sql`), Vercel SPA deploy config (`vercel.json`), Docker prod setup | Completed |
| **Phase 9** | Supabase Auth gating for `/admin`, Editor role policies, Stripe/Razorpay live webhooks, universe-schema migration (universes/motifs tables + product columns), Journal CMS (planned) | Next |