# 07 — Backend & Admin (Strapi v5)

> **Source of truth for the backend and admin direction.** The storefront (Phases 0–5)
> is a pure static frontend by design; all persistence, media, and roles live behind
> `src/lib/data.ts`. This doc defines how that seam becomes a real backend without
> rewriting the UI.

---

## 1. Decision record

**Chosen: Strapi v5 (self-hosted).**

| Requirement | How Strapi covers it |
|---|---|
| Inventory management per variant | Product Variant content type with `quantity` int; stock status derived server-side or in `data.ts` |
| Add / customize / upload products | Admin panel + REST upload media library; Product schema mirrors `src/lib/data.ts` types exactly |
| Manage products per category | Category content type with ordered relation to Products |
| Editor dashboard (articles + prices) | Built-in roles: custom **Editor** role with write access to Article + Product prices only |
| Journal / editorial storytelling | Article content type with rich text + media |
| Headless-ready swap (STAR_GOAL §A) | Only `src/lib/data.ts` changes; components untouched |

Rejected alternatives (recorded for future re-evaluation): Medusa v2 (heavier infra,
editorial content would need extension anyway), Sanity (admin UI would be hand-built).

---

## 2. Architecture

```
┌────────────────────────┐        ┌──────────────────────────────┐
│  Storefront (Vite SPA) │  REST  │  Strapi v5                   │
│  React 19 + TS         │◄──────►│  /api/products               │
│  TanStack Query        │  JSON  │  /api/categories             │
│  Zustand (cart, UI)    │        │  /api/articles               │
│  ...unchanged...       │        │  Admin: /admin (roles, CRUD) │
└────────────────────────┘        └──────────────┬───────────────┘
                                                 │
                                          SQLite (dev) → Postgres (prod)
                                          Media library (local → S3/R2)
```

- **Monorepo layout:** keep the Vite app at repo root; add `backend/` directory
  containing the Strapi project. One repo, two processes.
- **Dev:** `npm run dev` (Vite :5173) + `npm run dev` inside `backend/` (Strapi :1337).
- **Prod (first deployment):** static storefront on any static host (Netlify/Vercel/
  Cloudflare Pages) + Strapi on a small VPS/Railway with Postgres.

### Public API access
Strapi default is **authenticated-only**. For catalog browsing use the **Public role**
with `find` + `findOne` allowed on Product, Category, Article (read-only, published
entries only). All writes go through `/admin` with role checks. When checkout exists,
 introduce an API token for cart/order endpoints.

---

## 3. Content types

Field names deliberately match `src/lib/data.ts` interfaces 1:1 so the mapping layer
stays trivial.

### Product (collection)
| Field | Type | Notes |
|---|---|---|
| `slug` | uid | unique, from `name` |
| `name` | text (required) | |
| `subtitle` | text | |
| `description` | richtext | |
| `category` | relation → Category (many-to-one) | replaces `categorySlug` |
| `tags` | json (string[]) | |
| `variants` | component (repeatable) → `product-variant` | |
| `images` | media (multiple) | store `alt` via media metadata |
| `featured` | boolean | |
| `editorialImages` | media (multiple) | |
| `embroidery` | component (single) → `embroidery-detail` | |
| `customizable` | boolean | |
| `material` | json (string[]) | |
| `care` | json (string[]) | |
| `fit` | text | |

### Component: `product-variant`
`sku` (uid, required), `color` text, `colorHex` text, `size` text,
`priceCents` integer (required), `compareAtPriceCents` integer,
`quantity` integer, `status` enum(`in-stock` `low-stock` `out-of-stock`).

> Keep price **in cents** everywhere. Never floats. Same contract as the frontend.

### Component: `embroidery-detail`
`technique` enum (same 8 values as `EmbroideryTechnique`), `techniqueLabel` text,
`artisanHours` integer, `placement` json(string[]), `threadComposition` text,
`motifStory` text, `macroImage` media (single).

### Category (collection)
`slug` uid, `name` text, `label` text, `description` text, `image` media,
`order` integer (sort categories in nav).

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
| **Editor** (custom) | CRUD on Article; edit Product `priceCents` / `compareAtPriceCents` / `featured`; publish/unpublish both. **No** delete of products, **no** settings |
| **Staff** (optional, later) | Read-only catalog view for stock updates |

Notes:
- Price editing by editors: grant Product `update` permission; enforce field-level
restrictions with Strapi's field permissions (v5 admin roles support per-field
action scopes on content types) — restrict destroy + create, allow update.
- The admin panel is usable as-is for the editor dashboard in Phase 9; a custom
dashboard UI is only worth building later (see Phase 9 notes).

---

## 5. `data.ts` migration seam (Phase 7/8)

Current: synchronous functions reading imported JSON. Target: async client with the
**same exported names and shapes**.

```ts
// Target API shape (src/lib/data.ts) — same types, now async
export async function getProducts(): Promise<Product[]>
export async function getCategories(): Promise<Category[]>
export async function getProduct(slug: string): Promise<Product | undefined>
// ...getFeaturedProducts, getProductsByCategory, filterProducts unchanged logic
```

- Introduce **TanStack Query** for fetch/cache; components use hooks
  (`useProducts()`, `useProduct(slug)`) that call `data.ts` functions.
- `products.json` / `categories.json` become **dev seed data** (loaded into Strapi
  during Phase 8 via seed script so the admin manages the same catalog).
- Stock status stays derived: `quantity: 0 → out-of-stock`, `1–3 → low-stock`,
  `>3 → in-stock` (server returns raw quantity; data layer derives status if absent).

### REST mapping
| Frontend call | Strapi endpoint |
|---|---|
| `getProducts()` | `GET /api/products?populate=deep` |
| `getProduct(slug)` | `GET /api/products?filters[slug][$eq]=:slug&populate=deep` |
| `getCategories()` | `GET /api/categories?sort=order` |
| `getFeaturedProducts()` | `GET /api/products?filters[featured][$eq]=true` |

Media URLs from Strapi are absolute; adapt `ProductImage.src` via a small
`resolveImageUrl()` helper so local `/images/...` paths keep working from JSON seed.

---

## 6. Phasing (extends docs/05-phases)

| Phase | Delivers |
|---|---|
| **7** | Async data layer + TanStack Query, JSON → dev seed, storefront unchanged UX |
| **8** | Strapi backend stood up, content types modeled, catalog seeded, `data.ts` → REST |
| **9** | Editor role configured, product upload + price edit + category management via admin, Article CMS flow live |