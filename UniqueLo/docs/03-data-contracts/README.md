# 03 — Data Contracts

> **Source of truth for types and data access.**  > Define the shape once. UI reads only through `lib/data.ts`. Never import JSON directly into components.

---

## 1. Core Types

Place these in `src/lib/data.ts`. They are the contract between the JSON dataset and every component.

```typescript
// src/lib/data.ts
export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/** Storefront currency is INR; prices are held in paise (cents) for safe math. */
export type Currency = 'INR';

export interface ProductImage {
  /** Public URL relative to /public, e.g. "/images/products/cashmere-coat-1.jpg" */
  src: string;
  /** Required alt text for accessibility */
  alt: string;
  /** Optional dominant color for blur-up placeholder */
  color?: string;
}

export interface ProductVariant {
  /** Unique within the product, e.g. "black-m" */
  sku: string;
  color: string;
  /** Hex code used for swatches */
  colorHex: string;
  size: string;
  /** Price in cents for safe math */
  priceCents: number;
  /** Compare-at / MSRP in cents */
  compareAtPriceCents?: number;
  status: ProductStatus;
  /** How many remain if low-stock */
  quantity?: number;
}

export type EmbroideryTechnique =
  | 'hand-zardozi'
  | 'french-knot'
  | 'satin-stitch'
  | 'crewel-needlework'
  | 'kantha-quilt'
  | 'metallic-zari'
  | 'botanical-chain'
  | 'sashiko-selvedge'
  | 'monogram-bespoke';

export interface EmbroideryDetail {
  technique: EmbroideryTechnique;
  techniqueLabel: string;
  artisanHours?: number;
  placement: string[];
  threadComposition: string;
  motifStory: string;
  macroImage?: ProductImage;
}

export interface Product {
  /** Stable URL slug, e.g. "sakura-ronin-hoodie" */
  slug: string;
  name: string;
  /** Short tagline shown under name */
  subtitle: string;
  /** Decorative transliteration shown beside the universe tag */
  foreignTagline?: string;
  /** Long description for PDP */
  description: string;
  /** Category slug that matches categories.json */
  categorySlug: string;
  /** Universe this product belongs to (exactly one). Extensible — new universes need no code changes. */
  universeSlug?: string;
  /** Free-vocabulary garment type facet (hoodie, tee, jacket, cap, tote, lowers…). */
  garmentType?: string;
  /** Gender facet. `unisex` appears under both Men and Women. */
  gender?: 'men' | 'women' | 'unisex';
  /** Motif lore link (motifs.json id). */
  motifId?: string;
  /** Style-vibe tokens (registry: vibes.json). Presentation hints, never merchandising. */
  vibes?: string[];
  /** Buyer-intent mood tags (1–3 per product, registry: moods.json). */
  moods?: string[];
  /** True for render-derived mock seed. Storefront shows mock catalog until real SKUs land. */
  isMock?: boolean;
  /** True only for genuinely handcrafted pieces; gates the "Handcrafted" tag on cards + PDP. */
  handcrafted?: boolean;
  /** Mock-phase social proof. Replaced by real review aggregates at launch. */
  rating?: number;
  reviewCount?: number;
  soldCount?: string;
  /** Tags for filtering / search */
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  /** Featured on home */
  featured: boolean;
  /** For lookbook / editorial placement */
  editorialImages?: ProductImage[];
  /** Embroidery craftsmanship metadata */
  embroidery?: EmbroideryDetail;
  /** Bespoke personalization enabled */
  customizable?: boolean;
  /** Optional metadata */
  material?: string[];
  care?: string[];
  fit?: string;
  /** Batch scarcity — rendered strictly only when both batchNumber and batchTotal are present. */
  batchNumber?: number;
  batchTotal?: number;
  craftRegion?: string;
  craftCluster?: string;
  fabricGsm?: string;
}

export interface Category {
  slug: string;
  name: string;
  /** Short label for nav / tabs */
  label: string;
  /** Description used in mega-menu and shop header */
  description: string;
  /** Hero image for category strip / mega-menu, relative to /public */
  image?: string;
  /** Display order */
  order: number;
}

export type SortKey = 'newest' | 'price-asc' | 'price-desc';

export interface FilterState {
  categorySlug: string | 'all';
  universeSlug?: string | 'all';
  gender?: 'men' | 'women' | 'unisex' | 'all';
  garmentTypes?: string[];
  vibe?: string | 'all';
  mood?: string | 'all';
  colors: string[];
  sizes: string[];
  techniques?: EmbroideryTechnique[];
  priceMax?: number;
  searchQuery?: string;
  sort: SortKey;
}

export interface CartCustomization {
  monogramText?: string;
  threadColor?: string;
  placement?: string;
}

export interface CartItem {
  id: string; // generated from slug + sku (+ customization hash if present)
  productSlug: string;
  variantSku: string;
  quantity: number;
  customization?: CartCustomization;
}
```

---

## 2. Canonical Dataset

**Source of truth: `src/data/mock-products.json` (5 curated products, 31 variants as of 2026-10-12), plus the registries `universes.json`, `motifs.json`, `vibes.json`, `moods.json`.**

> `src/data/products.json` (the original 13-product atelier line) was
> **deleted on 2026-10-12** as stale local data — it is no longer imported
> anywhere and no longer on disk. `supabase/seed.sql` (as migrated 2026-10-11)
> still seeds that legacy line with `is_mock = false`, and the schema now
> carries the full universe columns.
> **Caution:** `getProducts()` does not yet filter `is_mock` (docs/08 §03-2c
> requirement) — after applying the migrated seed, legacy rows pass universe
> feature-detection and would leak to the storefront. Add the `.eq('is_mock',
> true)` guard (or treat this as a real-SKU launch, not a mock-phase deploy).
> Precedence:
> **`mock-products.json` (bundled, mock phase) → Supabase `is_mock = true`
> rows (real SKUs, post-launch)**.

### `src/data/categories.json`

```json
{
  "categories": [
    {
      "slug": "all",
      "name": "All Collections",
      "label": "All",
      "description": "The complete edit.",
      "order": 0
    },
    {
      "slug": "outerwear",
      "name": "Outerwear",
      "label": "Outerwear",
      "description": "Tailored coats and relaxed jackets for every season.",
      "image": "/images/categories/outerwear.jpg",
      "order": 1
    },
    {
      "slug": "knitwear",
      "name": "Knitwear",
      "label": "Knitwear",
      "description": "Cashmere, merino, and cotton layers.",
      "image": "/images/categories/knitwear.jpg",
      "order": 2
    },
    {
      "slug": "tops",
      "name": "Tops",
      "label": "Tops",
      "description": "Shirts, tees, and refined essentials.",
      "image": "/images/categories/tops.jpg",
      "order": 3
    },
    {
      "slug": "bottoms",
      "name": "Bottoms",
      "label": "Bottoms",
      "description": "Trousers, denim, and skirts.",
      "image": "/images/categories/bottoms.jpg",
      "order": 4
    },
    {
      "slug": "accessories",
      "name": "Accessories",
      "label": "Accessories",
      "description": "Leather goods, scarves, and finishing touches.",
      "image": "/images/categories/accessories.jpg",
      "order": 5
    }
  ]
}
```

### `src/data/mock-products.json`

The storefront catalog. As of 2026-10-12 it holds 5 curated products
(`isMock: true`, the featured set covering all 3 universes) — 2 Animeverse,
2 Heroverse, 1 Itihaas — each with:

- 1 slug + name + subtitle + description
- 1 categorySlug matching `categories.json`, 1 universeSlug matching `universes.json`
- 1–3 mood tags + vibe tokens (registry-driven facets)
- 1+ variants with at least one color and one size (31 variants total; most have
  6–7)
- 6 images each (`sakura-ronin-hoodie` fully dedicated via the All-in-One
  spec-board intake; remaining SKUs reuse atelier/product imagery — see docs/06)
- rating / reviewCount / soldCount mock social proof (`isMock` gates honesty rules)

### Supporting registries

- `src/data/universes.json` — universe roster (slug, name, tagline, lore, landing copy, `theme_tokens`, order). Extensible: new universe = new JSON row + CSS block, no code changes.
- `src/data/motifs.json` — motif lore per universe (`id`, `universe_slug`, `meaning`, `ip_cleared`). Products reference motifs by `motifId`; motifs must be IP-cleared before use.
- `src/data/vibes.json` / `moods.json` — presentation-vibe and buyer-intent-mood registries driving the two home gateways and shop facets.

### Removed: `src/data/products.json`

The original 13-product / 45-variant atelier line was deleted on 2026-10-12
as stale local data (it had been unimported since the mock phase began).
The DB-side legacy record lives on in `supabase/seed.sql` (`is_mock = false`).
(`scripts/generate_assets.py` is a standalone PIL generator that reads
neither catalog file.)

---

## 3. Data-Access Layer (`src/lib/data.ts`)

This is the **only file** allowed to read `mock-products.json`, `categories.json`, and the registries. It exposes typed helpers (async since Phase 7; consumed via TanStack Query hooks in `src/hooks/useCatalog.ts`).

### Required Exports

```typescript
// src/lib/data.ts — async since Phase 7 (Supabase queries when configured,
// bundled JSON fallback otherwise; consumed via TanStack Query in useCatalog.ts)

export { type Product, type ProductImage, type ProductVariant, type ProductStatus } from './types'; // if split

/** All products */
export async function getProducts(): Promise<Product[]>;

/** All categories, ordered */
export async function getCategories(): Promise<Category[]>;

/** One category by slug */
export async function getCategory(slug: string): Promise<Category | undefined>;

/** One product by slug */
export async function getProduct(slug: string): Promise<Product | undefined>;

/** Products for a category, or all if 'all' */
export async function getProductsByCategory(categorySlug: string | 'all'): Promise<Product[]>;

/** All universes (extensible registry) */
export async function getUniverses(): Promise<Universe[]>;

/** One universe by slug */
export async function getUniverse(slug: string): Promise<Universe | undefined>;

/** Motif lore for a universe / single motif (plus sync lookup) */
export async function getMotifsByUniverse(universeSlug: string): Promise<Motif[]>;
export async function getMotif(id: string | undefined): Promise<Motif | undefined>;
export function getMotifSync(id: string | undefined): Motif | undefined;

/** Products for a universe, or all if 'all' */
export async function getProductsByUniverse(universeSlug: string | 'all'): Promise<Product[]>;

/** Gender match (`unisex` matches both Men and Women) + gender-filtered products */
export function matchesGender(p: Product, gender: Gender | 'all'): boolean;
export async function getProductsByGender(gender: Gender | 'all'): Promise<Product[]>;

/** Count helper for gateway rails */
export function countBy<T>(items: T[], key: (t: T) => string | undefined): Record<string, number>;

/** Featured products for home page, sorted by order in JSON */
export async function getFeaturedProducts(limit?: number): Promise<Product[]>;

/** Unique colors across all products */
export async function getAllColors(): Promise<{ name: string; hex: string }[]>;

/** Unique sizes across all products, sorted naturally */
export async function getAllSizes(): Promise<string[]>;

/** Craft-technique taxonomy (labels for faceted filter) */
export async function getAllTechniques(): Promise<{ technique: EmbroideryTechnique; label: string }[]>;
export async function getCraftTechniques(): Promise<CraftTechniqueInfo[]>;
export async function getCraftTechnique(slug: string): Promise<CraftTechniqueInfo | undefined>;

/** Maximum price among all variants */
export async function getMaxPriceCents(): Promise<number>;

/** Image URL resolution (local assets + Supabase Storage) */
export function resolveImageUrl(src: string): string;

/** Filter + sort products. Reused by shop page. */
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[];

/** Format paise to INR string, e.g. "₹420" (en-IN, no decimals) */
export function formatPrice(cents: number): string;

/** Pick the default variant (first in-stock → low-stock → non-out-of-stock → first) */
export function getDefaultVariant(product: Product): ProductVariant;

/** Get available sizes for a given color */
export function getSizesForColor(product: Product, color: string): ProductVariant[];

/** Reviews + newsletter + orders (Supabase writes, local fallback) */
export async function getReviews(productSlug: string): Promise<Review[]>;
export async function submitReview(review: Omit<Review, 'id' | 'createdAt' | 'verified'>): Promise<boolean>;
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }>;
export async function createOrder(input: CreateOrderInput): Promise<{ success: boolean; orderId?: string; message: string }>;
```

### Implementation Rules

1. Import JSON via `import products from '../data/mock-products.json'` with `resolveJsonModule` (async helpers since Phase 7; Supabase queries when configured, JSON fallback otherwise).
2. Keep helpers pure (no side effects).
3. Do not mutate the imported arrays; return new arrays/objects.
4. Throw **only** on programmer errors (e.g., missing required slug). Return `undefined` for missing lookups.
5. All price math happens in cents. Display only via `formatPrice()`.

---

## 4. Filtering Logic

`filterProducts` must apply all active filters as an **AND** match:

1. If `categorySlug !== 'all'`, include only matching `categorySlug`.
2. If `universeSlug` is set and !== `'all'`, include only that universe.
3. If `gender` is set and !== `'all'`, include via `matchesGender()` (`unisex` matches both Men and Women).
4. If `garmentTypes` is non-empty, include products whose `garmentType` is listed.
5. If `vibe` is set and !== `'all'`, include products whose `vibes[]` includes it.
6. If `mood` is set and !== `'all'`, include products whose `moods[]` includes it.
7. If `techniques` is non-empty, include products whose `embroidery.technique` is listed.
8. If `colors` is non-empty, include products that have **at least one variant** whose color is in `colors`.
9. If `sizes` is non-empty, include products that have **at least one variant** whose size is in `sizes`.
10. If `priceMax` is set and > 0, include products with **at least one variant** whose `priceCents <= priceMax`.
11. If `searchQuery` is non-blank, match (case-insensitive) against name, subtitle, description, tags, and `embroidery.techniqueLabel`.
12. Sort by:
   - `newest` → order in JSON (mock-products.json is authored newest-first).
   - `price-asc` → min variant price ascending.
   - `price-desc` → max variant price descending.

---

## 5. Cart Helpers (`src/lib/data.ts`)

Cart state is stored in Zustand, but price/variant resolution uses the data layer.

```typescript
/** Build a display CartLine from a CartItem */
export function getCartLine(
  item: CartItem,
  products: Product[]
): CartLine | null;

export interface CartLine {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  lineTotalCents: number;
  customization?: CartCustomization;
}
```

---

## 6. JSON Schema Checklist

Before any build, verify:

- [ ] Every `categorySlug` in `mock-products.json` exists in `categories.json`.
- [ ] Every `universeSlug` in `mock-products.json` exists in `universes.json`; every `motifId` in `motifs.json` (and is `ip_cleared`).
- [ ] Every product has at least 2 images (storefront SKUs carry 6 each).
- [ ] Every product has at least 1 in-stock variant.
- [ ] `colorHex` values are valid 3- or 6-digit hex strings.
- [ ] `priceCents` is a positive integer.
- [ ] `sku` values are unique within the product.
- [ ] Image `src` paths start with `/images/`.
- [ ] Featured products are a subset of all products and ≤ 6.

A future phase may add a small validation script. For Phase 1, check manually and with TypeScript strict mode.

---

## 7. Backend Swap Contract

When a real backend arrives, only `src/lib/data.ts` changes:

1. Keep every exported function signature identical.
2. Replace JSON imports with fetch calls or SDK calls.
3. Add loading/error states inside the data layer (return `null`/`undefined` for missing data, never throw for network errors unless explicitly designed to).
4. Update this doc with the new backend source.

UI files, components, and stores remain untouched.

