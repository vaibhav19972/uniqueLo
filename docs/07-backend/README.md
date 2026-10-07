# 07 — Backend & Cloud Architecture (Supabase + Vercel)

> **Source of truth for the UniqueLo backend and database architecture.**
> Aligned with the TMS project deployment pattern: immediate deployment on **Vercel** 
> (SPA edge CDN) paired with **Supabase** (managed PostgreSQL with Row Level Security, 
> auth, and realtime storage), backed by multi-stage Docker containers for real production servers.
> All data querying lives behind `src/lib/supabase.ts` and `src/lib/data.ts` with zero-config 
> bundled fallback.

---

## 1. Decision record

**Chosen: Supabase (Managed Postgres + RLS) + Vercel Edge SPA.**

| Requirement | How Supabase + Vercel covers it |
|---|---|
| Immediate cloud deployment | Vercel provides instant zero-config preview & production deployments with SPA routing (`vercel.json`) |
| Relational data model | Full PostgreSQL schema (`supabase/schema.sql`) for products, variants, craft taxonomy, reviews, and orders |
| Role-Based Security & Permissions | PostgreSQL Row Level Security (RLS) policies enforce public read access and secured admin/order writes |
| Fast catalog browsing & fail-safe | Frontend queries Supabase via `@supabase/supabase-js`, falling back seamlessly to bundled JSON (`products.json`) if keys are unset |
| Inventory & Variant Tracking | `product_variants` table tracks SKU, size, colorway, cents price, quantity, and stock status |
| Craft Provenance & Macro Media | `embroidery_details` table stores artisan hours, guild clusters, regions, stitch types, and thread compositions |
| Production Server Containerization | Multi-stage `Dockerfile` with optimized Alpine Nginx reverse proxy + `docker-compose.prod.yml` |

---

## 2. Architecture

```
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│  Storefront (Vercel Edge CDN)   │           │  Supabase Cloud (PostgreSQL 16)      │
│  React 19 + TypeScript + Vite   │   HTTPS   │  Tables: products, categories,       │
│  TanStack Query caching layer   │◄─────────►│  product_variants, embroidery,       │
│  Zustand (Cart, Customizer, UI) │  REST/SQL │  reviews, newsletter, orders         │
│  Failsafe: bundled JSON fallback│           │  Security: Row Level Security (RLS)  │
└─────────────────────────────────┘           └──────────────────────────────────────┘
                 │                                                │
                 ▼                                                ▼
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│  Self-Hosted Linux / Docker     │           │  Storage & Edge                      │
│  Multi-stage Dockerfile         │           │  Supabase Storage Bucket: product-media│
│  Nginx 1.25 Alpine reverse proxy│           │  CDN Caching & HTTP/2 Headers        │
└─────────────────────────────────┘           └──────────────────────────────────────┘
```

- **Environment Configuration:**
  - `VITE_SUPABASE_URL`: Supabase project URL (`https://your-project.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY`: Safe public anon JWT key
  - Fallback mode: If environment variables are empty or Supabase is unreachable, the store operates without error using local static JSON.

---

## 3. Database Schema (`supabase/schema.sql`)

Field names match `src/lib/data.ts` TypeScript types 1:1.

### `categories`
`id` (uuid, PK), `slug` (text, unique), `name` (text), `label` (text), `description` (text), `image` (text), `display_order` (int).

### `products`
`id` (uuid, PK), `slug` (text, unique), `name` (text), `subtitle` (text), `description` (text), `category_id` (FK → categories), `tags` (text[]), `featured` (bool), `customizable` (bool), `fit` (text), `batch_number` (int), `batch_total` (int), `craft_region` (text), `craft_cluster` (text), `fabric_gsm` (text), `created_at` (timestamptz).

### `product_variants`
`id` (uuid, PK), `product_id` (FK → products), `sku` (text, unique), `color` (text), `color_hex` (text), `size` (text), `price_cents` (int), `compare_at_price_cents` (int), `quantity` (int), `status` (text: in-stock, low-stock, out-of-stock).

### `embroidery_details`
`id` (uuid, PK), `product_id` (FK → products, unique), `technique` (text), `technique_label` (text), `artisan_hours` (int), `placement` (text[]), `thread_composition` (text), `motif_story` (text), `macro_image` (text).

### `reviews`
`id` (uuid, PK), `product_slug` (text), `author` (text), `rating` (int), `title` (text), `comment` (text), `verified` (bool), `created_at` (timestamptz).

### `newsletter_subscribers` & `orders`
Direct capture tables for marketing dispatches and customer checkouts.order` integer (sort categories in nav).

### Article (collection) — for the Editor dashboard / Atelier Journal
`slug` uid, `title` text (required), `excerpt` text, `body` richtext,
`coverImage` media, `relatedProducts` relation → Product (many-to-many),
`publishedAt` (built-in DRAFT/PUBLISHED workflow).

---

## 4. Roles & permissions (the Editor dashboard)

Strapi ships an admin panel; configure roles once in **Settings → Roles**:

| Role | Can do |
|---|---|
| **Admin** (built-in Super Admin) | Everything incl. roles, plugins, settings |
---

## 4. Security & Permissions (PostgreSQL RLS)

Supabase applies fine-grained Row Level Security (RLS) on each table:

| Table | RLS Policy | Access Scope |
|---|---|---|
| `categories` | Public SELECT | All visitors can browse active categories |
| `products` | Public SELECT | All visitors can browse active catalog garments |
| `product_variants` | Public SELECT | Public inventory and size/color availability |
| `embroidery_details` | Public SELECT | Public craft provenance and stitch details |
| `reviews` | Public SELECT + Authenticated/Anon INSERT | Visitors can read verified reviews and submit new feedback |
| `newsletter_subscribers`| Public INSERT | Newsletter and dispatch lead capture |
| `orders` & `order_items`| Authenticated/Anon INSERT | Secured customer order placement |

---

## 5. `data.ts` Migration Seam & Client Architecture

All database queries pass through `src/lib/supabase.ts` into `src/lib/data.ts`.
Components use TanStack Query hooks (`useProducts()`, `useProduct(slug)`, `useCraftTechniques()`).

- **Fail-Safe Fallback:** If `VITE_SUPABASE_URL` is omitted, `src/lib/data.ts` smoothly falls back to bundled `src/data/products.json`.
- **Image URL Resolution:** `resolveImageUrl()` supports both relative local assets (`/images/products/...`) and Supabase Storage URLs.
- **Stock Status Derivation:** Real-time quantity thresholds (`0 → out-of-stock`, `1–3 → low-stock`, `>3 → in-stock`).

---

## 6. Phasing Alignment (extends docs/05-phases)

| Phase | Delivers | Status |
|---|---|---|
| **Phase 7** | Async data layer, TanStack Query hooks (`useCatalog.ts`), React 19 compatibility | Completed |
| **Phase 8** | Supabase DDL schema (`schema.sql`), Seed dataset (`seed.sql`), Vercel SPA deploy config (`vercel.json`), Docker prod setup | Completed |
| **Phase 9** | Supabase Auth, Admin/Editor product management dashboard, Stripe/Razorpay live webhook integration | Next |

| **9** | Editor role configured, product upload + price edit + category management via admin, Article CMS flow live |