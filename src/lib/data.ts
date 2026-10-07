import rawProducts from '../data/products.json';
import rawCategories from '../data/categories.json';

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type Currency = 'USD';

export interface ProductImage {
  src: string;
  alt: string;
  color?: string;
}

export interface ProductVariant {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceCents: number;
  compareAtPriceCents?: number;
  status: ProductStatus;
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
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  featured: boolean;
  editorialImages?: ProductImage[];
  embroidery?: EmbroideryDetail;
  customizable?: boolean;
  material?: string[];
  care?: string[];
  fit?: string;
}

export interface Category {
  slug: string;
  name: string;
  label: string;
  description: string;
  image?: string;
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
  id: string;
  productSlug: string;
  variantSku: string;
  quantity: number;
  customization?: CartCustomization;
}

export interface CartLine {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  lineTotalCents: number;
  customization?: CartCustomization;
}

// ─────────────────────────────────────────────────────────────────────
// Async data layer (Phase 7)
//
// Two sources behind one seam:
//  • VITE_API_URL set  → fetch from Strapi (Phase 8, docs/07-backend)
//  • VITE_API_URL unset → bundled seed JSON (identical types)
//
// All UI consumes this module or the hooks in src/hooks/useCatalog.ts.
// ─────────────────────────────────────────────────────────────────────

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

/** Map local/relative image paths and Strapi media URLs to fetchable URLs. */
export function resolveImageUrl(src: string): string {
  if (!src) return '/images/placeholders/hero.jpg';
  // Absolute URLs (Strapi media library) pass through
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Strapi-relative media paths → API origin
  if (src.startsWith('/') && API_URL && (src.includes('/uploads/') || src.startsWith('/api/'))) {
    return `${API_URL}${src}`;
  }
  // Local public assets pass through unchanged
  return src;
}

/** Derive stock status from quantity when a backend omits/carries raw counts. */
function deriveStatus(quantity: number | undefined, status?: ProductStatus): ProductStatus {
  if (typeof quantity === 'number') {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= 3) return 'low-stock';
    return 'in-stock';
  }
  return status ?? 'in-stock';
}

// ── Strapi response normalization ───────────────────────────────────

interface StrapiVariantPayload {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceCents: number;
  compareAtPriceCents?: number;
  quantity?: number;
  status?: ProductStatus;
}

interface StrapiProductPayload {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  categorySlug?: string;
  category?: { slug: string } | null;
  tags?: string[] | { tag: string }[];
  variants?: StrapiVariantPayload[];
  images?: { url: string; alternativeText?: string }[];
  featured?: boolean;
  editorialImages?: { url: string; alternativeText?: string }[];
  embroidery?: {
    technique: EmbroideryTechnique;
    techniqueLabel: string;
    artisanHours?: number;
    placement?: string[];
    threadComposition?: string;
    motifStory?: string;
    macroImage?: { url: string; alternativeText?: string };
  } | null;
  customizable?: boolean;
  material?: string[];
  care?: string[];
  fit?: string;
}

function normalizeImages(
  media: { url: string; alternativeText?: string }[] | undefined,
  fallbackName: string
): ProductImage[] {
  if (!media) return [];
  return media.map((m) => ({
    src: resolveImageUrl(m.url),
    alt: m.alternativeText || fallbackName,
  }));
}

function normalizeProduct(raw: StrapiProductPayload): Product {
  return {
    slug: raw.slug,
    name: raw.name,
    subtitle: raw.subtitle ?? '',
    description: raw.description ?? '',
    categorySlug: raw.category?.slug ?? raw.categorySlug ?? '',
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => (typeof t === 'string' ? t : t.tag))
      : [],
    variants: (raw.variants ?? []).map((v) => ({
      sku: v.sku,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      priceCents: v.priceCents,
      compareAtPriceCents: v.compareAtPriceCents,
      status: deriveStatus(v.quantity, v.status),
      quantity: v.quantity,
    })),
    images: normalizeImages(
      raw.images?.map((m) => ({ url: resolveImageUrl(m.url), alternativeText: m.alternativeText })),
      raw.name
    ),
    featured: raw.featured ?? false,
    editorialImages: normalizeImages(
      raw.editorialImages?.map((m) => ({ url: resolveImageUrl(m.url), alternativeText: m.alternativeText })),
      raw.name
    ),
    embroidery: raw.embroidery
      ? {
          technique: raw.embroidery.technique,
          techniqueLabel: raw.embroidery.techniqueLabel,
          artisanHours: raw.embroidery.artisanHours,
          placement: raw.embroidery.placement ?? [],
          threadComposition: raw.embroidery.threadComposition ?? '',
          motifStory: raw.embroidery.motifStory ?? '',
          macroImage: raw.embroidery.macroImage
            ? {
                src: resolveImageUrl(raw.embroidery.macroImage.url),
                alt: raw.embroidery.macroImage.alternativeText || raw.name,
              }
            : undefined,
        }
      : undefined,
    customizable: raw.customizable ?? false,
    material: raw.material ?? [],
    care: raw.care ?? [],
    fit: raw.fit,
  };
}

// ── Seed data (bundled JSON, dev fallback) ──────────────────────────

const seedProducts: Product[] = (rawProducts as { products: Product[] }).products.map(
  (p) => ({
    ...p,
    images: p.images.map((i) => ({ ...i, src: resolveImageUrl(i.src) })),
    editorialImages: p.editorialImages?.map((i) => ({ ...i, src: resolveImageUrl(i.src) })),
  })
);
const seedCategories: Category[] = (rawCategories as { categories: Category[] }).categories;

// ── Tiny fetch helper (Strapi REST) ─────────────────────────────────

async function strapiFetch<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not configured');
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} (${path})`);
  }
  return (await res.json()) as T;
}

// ── Public API (same names as before, now async) ────────────────────

/** All products */
export async function getProducts(): Promise<Product[]> {
  if (API_URL) {
    const data = await strapiFetch<{ data: StrapiProductPayload[] }>(
      '/api/products?populate=deep&sort=slug'
    );
    return data.data.map(normalizeProduct);
  }
  return [...seedProducts];
}

/** All categories, ordered */
export async function getCategories(): Promise<Category[]> {
  if (API_URL) {
    const data = await strapiFetch<{
      data: (Omit<Category, 'image'> & { image?: { url: string } | null })[];
    }>('/api/categories?sort=order:asc&populate=image');
    return data.data.map((c) => ({
      slug: c.slug,
      name: c.name,
      label: c.label,
      description: c.description,
      image: c.image?.url ? resolveImageUrl(c.image.url) : undefined,
      order: c.order,
    }));
  }
  return [...seedCategories].sort((a, b) => a.order - b.order);
}

/** One category by slug */
export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

/** One product by slug */
export async function getProduct(slug: string): Promise<Product | undefined> {
  if (API_URL) {
    const data = await strapiFetch<{ data: StrapiProductPayload[] }>(
      `/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=deep`
    );
    const raw = data.data[0];
    return raw ? normalizeProduct(raw) : undefined;
  }
  return seedProducts.find((p) => p.slug === slug);
}

/** Products for a category, or all if 'all' */
export async function getProductsByCategory(categorySlug: string | 'all'): Promise<Product[]> {
  const products = await getProducts();
  if (categorySlug === 'all') return products;
  return products.filter((p) => p.categorySlug === categorySlug);
}

/** Featured products for home page, sorted by order in JSON */
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  if (API_URL) {
    const data = await strapiFetch<{ data: StrapiProductPayload[] }>(
      '/api/products?filters[featured][$eq]=true&populate=deep'
    );
    const featured = data.data.map(normalizeProduct);
    return typeof limit === 'number' ? featured.slice(0, limit) : featured;
  }
  const featured = seedProducts.filter((p) => p.featured);
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

/** Unique colors across all products */
export async function getAllColors(): Promise<{ name: string; hex: string }[]> {
  const products = await getProducts();
  const map = new Map<string, string>();
  for (const product of products) {
    for (const v of product.variants) {
      if (!map.has(v.color)) {
        map.set(v.color, v.colorHex);
      }
    }
  }
  return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
}

/** Unique sizes across all products, sorted naturally */
export async function getAllSizes(): Promise<string[]> {
  const products = await getProducts();
  const set = new Set<string>();
  for (const product of products) {
    for (const v of product.variants) {
      set.add(v.size);
    }
  }
  const sizePriority: Record<string, number> = {
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    XXL: 6,
    OS: 10,
  };
  return Array.from(set).sort((a, b) => {
    const prioA = sizePriority[a.toUpperCase()] ?? 99;
    const prioB = sizePriority[b.toUpperCase()] ?? 99;
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

/** Maximum price among all variants */
export async function getMaxPriceCents(): Promise<number> {
  const products = await getProducts();
  let max = 0;
  for (const product of products) {
    for (const v of product.variants) {
      if (v.priceCents > max) {
        max = v.priceCents;
      }
    }
  }
  return max;
}

/** Filter + sort products. Reused by shop page. */
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  const result = products.filter((product) => {
    // Category check
    if (filters.categorySlug !== 'all' && product.categorySlug !== filters.categorySlug) {
      return false;
    }

    // Technique check
    if (filters.techniques && filters.techniques.length > 0) {
      if (!product.embroidery || !filters.techniques.includes(product.embroidery.technique)) {
        return false;
      }
    }

    // Colors check (at least one variant matches)
    if (filters.colors.length > 0) {
      const hasColor = product.variants.some((v) => filters.colors.includes(v.color));
      if (!hasColor) return false;
    }

    // Sizes check (at least one variant matches)
    if (filters.sizes.length > 0) {
      const hasSize = product.variants.some((v) => filters.sizes.includes(v.size));
      if (!hasSize) return false;
    }

    // Max price check (at least one variant price <= priceMax)
    if (typeof filters.priceMax === 'number' && filters.priceMax > 0) {
      const withinPrice = product.variants.some((v) => v.priceCents <= (filters.priceMax as number));
      if (!withinPrice) return false;
    }

    return true;
  });

  // Sort
  if (filters.sort === 'price-asc') {
    result.sort((a, b) => {
      const minA = Math.min(...a.variants.map((v) => v.priceCents));
      const minB = Math.min(...b.variants.map((v) => v.priceCents));
      return minA - minB;
    });
  } else if (filters.sort === 'price-desc') {
    result.sort((a, b) => {
      const maxA = Math.max(...a.variants.map((v) => v.priceCents));
      const maxB = Math.max(...b.variants.map((v) => v.priceCents));
      return maxB - maxA;
    });
  }
  // 'newest' preserves underlying order

  return result;
}

/** Format cents to USD string, e.g. "$420.00" */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/** Pick the default variant for a product (first in-stock, else first) */
export function getDefaultVariant(product: Product): ProductVariant {
  const inStock = product.variants.find((v) => v.status === 'in-stock');
  return inStock || product.variants[0];
}

/** Get available sizes for a given color */
export function getSizesForColor(product: Product, color: string): ProductVariant[] {
  return product.variants.filter((v) => v.color.toLowerCase() === color.toLowerCase());
}

/** Build a display CartLine from a CartItem */
export function getCartLine(
  item: CartItem,
  products: Product[]
): CartLine | null {
  const product = products.find((p) => p.slug === item.productSlug);
  if (!product) return null;

  const variant = product.variants.find((v) => v.sku === item.variantSku);
  if (!variant) return null;

  return {
    id: item.id,
    product,
    variant,
    quantity: item.quantity,
    lineTotalCents: variant.priceCents * item.quantity,
    customization: item.customization,
  };
}