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

// Data access instances
const productsData: Product[] = (rawProducts as { products: Product[] }).products;
const categoriesData: Category[] = (rawCategories as { categories: Category[] }).categories;

/** All products */
export function getProducts(): Product[] {
  return [...productsData];
}

/** All categories, ordered */
export function getCategories(): Category[] {
  return [...categoriesData].sort((a, b) => a.order - b.order);
}

/** One category by slug */
export function getCategory(slug: string): Category | undefined {
  return categoriesData.find((c) => c.slug === slug);
}

/** One product by slug */
export function getProduct(slug: string): Product | undefined {
  return productsData.find((p) => p.slug === slug);
}

/** Products for a category, or all if 'all' */
export function getProductsByCategory(categorySlug: string | 'all'): Product[] {
  if (categorySlug === 'all') {
    return [...productsData];
  }
  return productsData.filter((p) => p.categorySlug === categorySlug);
}

/** Featured products for home page, sorted by order in JSON */
export function getFeaturedProducts(limit?: number): Product[] {
  const featured = productsData.filter((p) => p.featured);
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

/** Unique colors across all products */
export function getAllColors(): { name: string; hex: string }[] {
  const map = new Map<string, string>();
  for (const product of productsData) {
    for (const v of product.variants) {
      if (!map.has(v.color)) {
        map.set(v.color, v.colorHex);
      }
    }
  }
  return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
}

/** Unique sizes across all products, sorted naturally */
export function getAllSizes(): string[] {
  const set = new Set<string>();
  for (const product of productsData) {
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
export function getMaxPriceCents(): number {
  let max = 0;
  for (const product of productsData) {
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
  // 'newest' preserves array order from JSON

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
