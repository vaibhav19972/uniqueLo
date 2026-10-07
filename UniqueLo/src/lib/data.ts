import rawProducts from '../data/products.json';
import rawCategories from '../data/categories.json';
import { supabase, isSupabaseConfigured } from './supabase';

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
  searchQuery?: string;
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

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────
// Seed Fallback Data (bundled JSON)
// ─────────────────────────────────────────────────────────────────────

const seedProducts: Product[] = (rawProducts as { products: Product[] }).products;
const seedCategories: Category[] = (rawCategories as { categories: Category[] }).categories;

const mockReviews: Record<string, Review[]> = {
  'botanical-silk-embroidered-jacket': [
    {
      id: 'rev-1',
      productSlug: 'botanical-silk-embroidered-jacket',
      author: 'Eleanor Vance',
      rating: 5,
      title: 'Museum-grade needlework and incredible drape',
      comment: 'The botanical chain stitching along the collar is even more mesmerizing in person. The silk floss has a subtle luster in natural daylight that catches the eye immediately.',
      verified: true,
      createdAt: '2 days ago',
    },
    {
      id: 'rev-2',
      productSlug: 'botanical-silk-embroidered-jacket',
      author: 'Marcus Sterling',
      rating: 5,
      title: 'Pure artisanal luxury',
      comment: 'The heavyweight organic cotton canvas gives this jacket substantial structure. You can feel the weight of the 18 artisan hours poured into it.',
      verified: true,
      createdAt: '1 week ago',
    },
  ],
  'celestial-zardozi-wool-coat': [
    {
      id: 'rev-3',
      productSlug: 'celestial-zardozi-wool-coat',
      author: 'Julian D.',
      rating: 5,
      title: 'The gold bullion thread is breathtaking',
      comment: 'The French wire embroidery catches low evening light like nothing else in my wardrobe. True heirloom craftsmanship that will be passed down.',
      verified: true,
      createdAt: '3 days ago',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// Data API with Supabase + Local Fallback Seam
// ─────────────────────────────────────────────────────────────────────

export function resolveImageUrl(src: string): string {
  if (!src) return '/images/placeholders/hero.jpg';
  return src;
}

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          slug, name, subtitle, description, category_slug, tags, featured, customizable, material, care, fit,
          variants (sku, color, color_hex, size, price_cents, compare_at_price_cents, status, quantity),
          product_images (src, alt, color, sort_order),
          embroidery_details (technique, technique_label, artisan_hours, placement, thread_composition, motif_story, macro_image_src, macro_image_alt)
        `);

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          slug: item.slug,
          name: item.name,
          subtitle: item.subtitle,
          description: item.description,
          categorySlug: item.category_slug,
          tags: item.tags || [],
          featured: item.featured || false,
          customizable: item.customizable || false,
          material: item.material || [],
          care: item.care || [],
          fit: item.fit,
          variants: (item.variants || []).map((v: any) => ({
            sku: v.sku,
            color: v.color,
            colorHex: v.color_hex,
            size: v.size,
            priceCents: v.price_cents,
            compareAtPriceCents: v.compare_at_price_cents,
            status: v.status || 'in-stock',
            quantity: v.quantity,
          })),
          images: (item.product_images || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => ({
              src: img.src,
              alt: img.alt,
              color: img.color,
            })),
          embroidery: item.embroidery_details?.[0]
            ? {
                technique: item.embroidery_details[0].technique,
                techniqueLabel: item.embroidery_details[0].technique_label,
                artisanHours: item.embroidery_details[0].artisan_hours,
                placement: item.embroidery_details[0].placement || [],
                threadComposition: item.embroidery_details[0].thread_composition,
                motifStory: item.embroidery_details[0].motif_story,
                macroImage: item.embroidery_details[0].macro_image_src
                  ? {
                      src: item.embroidery_details[0].macro_image_src,
                      alt: item.embroidery_details[0].macro_image_alt || item.name,
                    }
                  : undefined,
              }
            : undefined,
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Instant local seed fallback
  return [...seedProducts];
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_num', { ascending: true });

      if (!error && data && data.length > 0) {
        return [
          {
            slug: 'all',
            name: 'All Collections',
            label: 'All',
            description: 'The complete atelier edit spanning artisanal embroidery and pure natural yarns.',
            order: 0,
          },
          ...data.map((c: any) => ({
            slug: c.slug,
            name: c.name,
            label: c.label,
            description: c.description,
            image: c.image,
            order: c.order_num,
          })),
        ];
      }
    } catch {
      // Fallback below
    }
  }

  return [...seedCategories].sort((a, b) => a.order - b.order);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(categorySlug: string | 'all'): Promise<Product[]> {
  const products = await getProducts();
  if (categorySlug === 'all') return products;
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

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

export async function getAllSizes(): Promise<string[]> {
  const products = await getProducts();
  const set = new Set<string>();
  for (const product of products) {
    for (const v of product.variants) {
      set.add(v.size);
    }
  }
  const sizePriority: Record<string, number> = {
    XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, OS: 10,
  };
  return Array.from(set).sort((a, b) => {
    const prioA = sizePriority[a.toUpperCase()] ?? 99;
    const prioB = sizePriority[b.toUpperCase()] ?? 99;
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export async function getAllTechniques(): Promise<{ technique: EmbroideryTechnique; label: string }[]> {
  const products = await getProducts();
  const map = new Map<EmbroideryTechnique, string>();
  for (const p of products) {
    if (p.embroidery) {
      map.set(p.embroidery.technique, p.embroidery.techniqueLabel);
    }
  }
  return Array.from(map.entries()).map(([technique, label]) => ({ technique, label }));
}

export async function getMaxPriceCents(): Promise<number> {
  const products = await getProducts();
  let max = 0;
  for (const product of products) {
    for (const v of product.variants) {
      if (v.priceCents > max) max = v.priceCents;
    }
  }
  return max;
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
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

    // Colors check
    if (filters.colors && filters.colors.length > 0) {
      const hasColor = product.variants.some((v) => filters.colors.includes(v.color));
      if (!hasColor) return false;
    }

    // Sizes check
    if (filters.sizes && filters.sizes.length > 0) {
      const hasSize = product.variants.some((v) => filters.sizes.includes(v.size));
      if (!hasSize) return false;
    }

    // Max price check
    if (typeof filters.priceMax === 'number' && filters.priceMax > 0) {
      const withinPrice = product.variants.some((v) => v.priceCents <= (filters.priceMax as number));
      if (!withinPrice) return false;
    }

    // Search query check
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSub = product.subtitle.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTag = product.tags.some((t) => t.toLowerCase().includes(q));
      const matchTech = product.embroidery?.techniqueLabel.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchDesc && !matchTag && !matchTech) {
        return false;
      }
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

  return result;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function getDefaultVariant(product: Product): ProductVariant {
  const inStock = product.variants.find((v) => v.status === 'in-stock');
  return inStock || product.variants[0];
}

export function getSizesForColor(product: Product, color: string): ProductVariant[] {
  return product.variants.filter((v) => v.color.toLowerCase() === color.toLowerCase());
}

export function getCartLine(item: CartItem, products: Product[]): CartLine | null {
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

// ─────────────────────────────────────────────────────────────────────
// Interactive Storefront Operations (Supabase + Local)
// ─────────────────────────────────────────────────────────────────────

export async function getReviews(productSlug: string): Promise<Review[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_slug', productSlug)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          productSlug: r.product_slug,
          author: r.author,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verified: r.verified,
          createdAt: new Date(r.created_at).toLocaleDateString(),
        }));
      }
    } catch {
      // fallback
    }
  }

  return mockReviews[productSlug] || [
    {
      id: 'default-1',
      productSlug,
      author: 'Clara Beaumont',
      rating: 5,
      title: 'Stunning embroidery tension and finish',
      comment: 'The stitchwork feels tactile and rich under the fingers. An exceptional addition to my permanent wardrobe.',
      verified: true,
      createdAt: 'Just now',
    },
  ];
}

export async function submitReview(review: Omit<Review, 'id' | 'createdAt' | 'verified'>): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('reviews').insert({
        product_slug: review.productSlug,
        author: review.author,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        verified: true,
      });
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error && error.code === '23505') {
        return { success: true, message: 'You are already enrolled in private atelier previews.' };
      }
      if (error) throw error;
      return { success: true, message: 'Welcome to the UniqueLo Atelier circle. Check your inbox for private access.' };
    } catch {
      // fallback
    }
  }
  return { success: true, message: 'Welcome to the UniqueLo Atelier circle. Your complimentary code is ATELIER10.' };
}