# 03 — Data Contracts

> **Source of truth for types and data access.**  > Define the shape once. UI reads only through `lib/data.ts`. Never import JSON directly into components.

---

## 1. Core Types

Place these in `src/lib/data.ts`. They are the contract between the JSON dataset and every component.

```typescript
// src/lib/data.ts
export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type Currency = 'USD';

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
  /** Stable URL slug, e.g. "botanical-silk-embroidered-jacket" */
  slug: string;
  name: string;
  /** Short tagline shown under name */
  subtitle: string;
  /** Long description for PDP */
  description: string;
  /** Category slug that matches categories.json */
  categorySlug: string;
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
  colors: string[];
  sizes: string[];
  techniques?: EmbroideryTechnique[];
  priceMax?: number;
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

### `src/data/products.json`

Populate with **12–20 products minimum** so the grid feels real. Each product must have:

- 1 slug
- 1 name + subtitle + description
- 1 categorySlug matching `categories.json`
- 2–4 tags
- 2+ variants with at least one color and one size
- 2+ images (first is default, second is hover)
- `featured: true` on 4–6 products

Example product entry:

```json
{
  "slug": "botanical-silk-embroidered-jacket",
  "name": "Botanical Silk Embroidered Jacket",
  "subtitle": "Hand-stitched flora on heavy washed organic cotton",
  "description": "An unstructured atelier workwear jacket featuring hand-embroidered botanical floral vine motifs along the collar, lapel, and back yoke using pure mulberry silk floss.",
  "categorySlug": "outerwear",
  "tags": ["jacket", "embroidery", "hand-stitched", "silk", "outerwear"],
  "variants": [
    { "sku": "bse-ind-s", "color": "Indigo", "colorHex": "#1d2a44", "size": "S", "priceCents": 58000, "status": "in-stock" },
    { "sku": "bse-ind-m", "color": "Indigo", "colorHex": "#1d2a44", "size": "M", "priceCents": 58000, "status": "in-stock" },
    { "sku": "bse-ind-l", "color": "Indigo", "colorHex": "#1d2a44", "size": "L", "priceCents": 58000, "status": "low-stock", "quantity": 2 },
    { "sku": "bse-ecr-s", "color": "Ecru", "colorHex": "#f4efe6", "size": "S", "priceCents": 58000, "status": "in-stock" },
    { "sku": "bse-ecr-m", "color": "Ecru", "colorHex": "#f4efe6", "size": "M", "priceCents": 58000, "status": "in-stock" }
  ],
  "images": [
    { "src": "/images/products/botanical-silk-jacket-1.jpg", "alt": "Botanical Silk Embroidered Jacket — front view", "color": "#1d2a44" },
    { "src": "/images/products/botanical-silk-jacket-2.jpg", "alt": "Botanical Silk Embroidered Jacket — macro stitch detail", "color": "#1d2a44" }
  ],
  "featured": true,
  "embroidery": {
    "technique": "botanical-chain",
    "techniqueLabel": "Hand-stitched Chain & Satin Needlework",
    "artisanHours": 18,
    "placement": ["Collar", "Back Yoke", "Left Cuff"],
    "threadComposition": "100% Spun Mulberry Silk Floss",
    "motifStory": "Inspired by 18th-century botanical illustrations of wild flora, hand-stitched by master artisans."
  },
  "customizable": true,
  "material": ["100% GOTS Organic Cotton Canvas", "Silk Floss Thread"],
  "care": ["Delicate dry clean only"],
  "fit": "Boxy atelier fit, true to size"
}
```

---

## 3. Data-Access Layer (`src/lib/data.ts`)

This is the **only file** allowed to read `products.json` and `categories.json`. It exposes typed helpers.

### Required Exports

```typescript
// src/lib/data.ts

export { type Product, type ProductImage, type ProductVariant, type ProductStatus } from './types'; // if split

/** All products */
export function getProducts(): Product[];

/** All categories, ordered */
export function getCategories(): Category[];

/** One category by slug */
export function getCategory(slug: string): Category | undefined;

/** One product by slug */
export function getProduct(slug: string): Product | undefined;

/** Products for a category, or all if 'all' */
export function getProductsByCategory(categorySlug: string | 'all'): Product[];

/** Featured products for home page, sorted by order in JSON */
export function getFeaturedProducts(limit?: number): Product[];

/** Unique colors across all products */
export function getAllColors(): { name: string; hex: string }[];

/** Unique sizes across all products, sorted naturally */
export function getAllSizes(): string[];

/** Maximum price among all variants */
export function getMaxPriceCents(): number;

/** Filter + sort products. Reused by shop page. */
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[];

/** Format cents to USD string, e.g. "$420.00" */
export function formatPrice(cents: number): string;

/** Pick the default variant for a product (first in-stock, else first) */
export function getDefaultVariant(product: Product): ProductVariant;

/** Get available sizes for a given color */
export function getSizesForColor(product: Product, color: string): ProductVariant[];
```

### Implementation Rules

1. Import JSON via `import products from '../data/products.json'` with `resolveJsonModule`.
2. Keep helpers pure (no side effects).
3. Do not mutate the imported arrays; return new arrays/objects.
4. Throw **only** on programmer errors (e.g., missing required slug). Return `undefined` for missing lookups.
5. All price math happens in cents. Display only via `formatPrice()`.

---

## 4. Filtering Logic

`filterProducts` must apply all active filters as an **AND** match:

1. If `categorySlug !== 'all'`, include only matching `categorySlug`.
2. If `colors` is non-empty, include products that have **at least one variant** whose color is in `colors`.
3. If `sizes` is non-empty, include products that have **at least one variant** whose size is in `sizes`.
4. If `priceMax` is set, include products with **at least one variant** whose `priceCents <= priceMax`.
5. Sort by:
   - `newest` → order in JSON (products.json is authored newest-first).
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
}
```

---

## 6. JSON Schema Checklist

Before any build, verify:

- [ ] Every `categorySlug` in `products.json` exists in `categories.json`.
- [ ] Every product has at least 2 images.
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

