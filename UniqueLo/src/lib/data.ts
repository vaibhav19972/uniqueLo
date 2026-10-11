import rawCategories from '../data/categories.json';
import rawMockProducts from '../data/mock-products.json';
import rawUniverses from '../data/universes.json';
import rawMotifs from '../data/motifs.json';
import rawVibes from '../data/vibes.json';
import rawMoods from '../data/moods.json';
import { supabase, isSupabaseConfigured } from './supabase';

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type Currency = 'INR';

/** Gender taxonomy: `unisex` matches BOTH Men and Women surfaces. */
export type Gender = 'men' | 'women' | 'unisex';

/**
 * Vibe = presentation-only token modifier (how loud a surface renders).
 * Registry: src/data/vibes.json — one JSON row + one [data-vibe] CSS block
 * per vibe; components never hardcode the list.
 */
export type Vibe = 'aesthetic' | 'clean' | 'minimal' | 'expressive' | 'noir' | 'pearl' | 'gilded';

/**
 * Mood = buyer-intent shopping family (why the customer is here).
 * Registry: src/data/moods.json. Products carry 1–3 mood tags; moods are
 * merchandising facets, never render modifiers.
 */
export type MoodSlug = 'everyday' | 'statement' | 'heritage' | 'festive-gifting' | 'comfort' | 'collector';

export interface VibeInfo {
  slug: Vibe;
  title: string;
  tagline: string;
  /** Featured vibes render as homepage gateway cards; the rest sit behind "More". */
  featured: boolean;
  order: number;
}

export interface MoodInfo {
  slug: MoodSlug;
  title: string;
  tagline: string;
  featured: boolean;
  order: number;
}

export interface UniverseThemeTokens {
  bg: string;
  surface: string;
  ink: string;
  accent: string;
  accent2: string;
  product_zone: string;
  divider: string;
  card_frame: string;
  texture_opacity: number;
  display_font: string;
}

export interface Universe {
  slug: string;
  name: string;
  tagline: string;
  lore: string;
  /** Display color for the portal-card title (chatgpt-v2 render 3). */
  portal_title_color?: string;
  /** Landing-page copy accents (chatgpt-v2 renders 8.1–8.3). */
  lore_heading?: string;
  hero_headline?: string;
  hero_headline_accent?: string;
  /** Explicit two-tone colors (8.2 gold accent / 8.3 brown lead). */
  hero_lead_color?: string;
  hero_accent_color?: string;
  hero_headline_case?: 'caps' | 'sentence';
  hero_kicker?: string;
  hero_ornament?: 'lotus' | 'compass';
  hero_note?: string;
  hero_vertical_text?: string;
  emblem_src?: string;
  drop_cadence?: string;
  is_active: boolean;
  order: number;
  theme_tokens: UniverseThemeTokens;
}

export interface Motif {
  id: string;
  universe_slug: string;
  name: string;
  meaning: string;
  symbol_notes?: string;
  /** Motifs must be IP-cleared before any product references them. */
  ip_cleared: boolean;
}

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
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  /** Decorative transliteration shown beside the universe tag (e.g. product-name script). */
  foreignTagline?: string;
  categorySlug: string;
  /** Universe this product belongs to (exactly one). Extensible — new universes need no code changes. */
  universeSlug?: string;
  /** Free-vocabulary garment type facet (hoodie, tee, jacket, cap, tote, lowers…). */
  garmentType?: string;
  /** Gender facet. `unisex` appears under both Men and Women. */
  gender?: Gender;
  /** Motif lore link (motifs.json id). */
  motifId?: string;
  /**
   * Discovery hint for the "Explore by Mood" gateway (counts + entry filtering).
   * Rendering stays token-driven; this only powers merchandising surfaces.
   */
  vibes?: Vibe[];
  /**
   * Buyer-intent mood tags (1–3 per product, from src/data/moods.json).
   * Powers the "Explore by Mood" gateway + mood facet — never rendering.
   */
  moods?: MoodSlug[];
  /** True for render-derived mock seed. Storefront shows mock catalog until real SKUs land. */
  isMock?: boolean;
  /**
   * True only for pieces that are genuinely handcrafted. Generic embroidery
   * copy must never claim handcraft — this flag gates the per-product
   * "Handcrafted" tag on cards + PDP.
   */
  handcrafted?: boolean;
  /** Mock-phase social proof. Replaced by real review aggregates at launch. */
  rating?: number;
  reviewCount?: number;
  soldCount?: string;
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
  batchNumber?: number;
  batchTotal?: number;
  craftRegion?: string;
  craftCluster?: string;
  fabricGsm?: string;
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
  universeSlug?: string | 'all';
  gender?: Gender | 'all';
  garmentTypes?: string[];
  vibe?: Vibe | 'all';
  mood?: MoodSlug | 'all';
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

const seedCategories: Category[] = (rawCategories as { categories: Category[] }).categories;
// NOTE: src/data/products.json (original 13) is deprecated-retained on disk and no
// longer imported. The storefront runs on mock-products.json until real SKUs land.
const mockProducts: Product[] = (rawMockProducts as { products: Product[] }).products;
const seedUniverses: Universe[] = (rawUniverses as { universes: Universe[] }).universes;
const seedMotifs: Motif[] = (rawMotifs as { motifs: Motif[] }).motifs;

/** Style-vibe registry (sorted by order). Homepage shows featured; rest behind "More". */
export const VIBES: VibeInfo[] = ((rawVibes as { vibes: VibeInfo[] }).vibes)
  .slice()
  .sort((a, b) => a.order - b.order);

/** Mood registry (sorted by order). Extensible — one JSON row, no code changes. */
export const MOODS: MoodInfo[] = ((rawMoods as { moods: MoodInfo[] }).moods)
  .slice()
  .sort((a, b) => a.order - b.order);

const mockReviews: Record<string, Review[]> = {
  // ── SAMPLE DATA (flagged): render-phase placeholders, replace with real reviews ──
  'sakura-ronin-hoodie': [
    {
      id: 'mock-rev-1',
      productSlug: 'sakura-ronin-hoodie',
      author: 'Arjun Mehta',
      rating: 5,
      title: 'Embroidery quality is next level',
      comment: 'Feels premium and even better in person. Oversized fit is perfect.',
      verified: true,
      createdAt: '2 weeks ago',
    },
  ],
  'koi-no-yume-sweatshirt': [
    {
      id: 'mock-rev-2',
      productSlug: 'koi-no-yume-sweatshirt',
      author: 'Ishita Rao',
      rating: 5,
      title: 'Perfect for anime events',
      comment: 'So many people asked me where I got this from.',
      verified: true,
      createdAt: '1 week ago',
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
          slug, name, subtitle, description, foreign_tagline, category_slug, universe_slug, garment_type, gender, motif_id, is_mock, handcrafted, vibes, moods, rating, review_count, sold_count, tags, featured, customizable, material, care, fit, batch_number, batch_total, craft_region, craft_cluster, fabric_gsm,
          variants (sku, color, color_hex, size, price_cents, compare_at_price_cents, status, quantity),
          product_images (src, alt, color, sort_order),
          embroidery_details (technique, technique_label, artisan_hours, placement, thread_composition, motif_story, macro_image_src, macro_image_alt)
        `);

      if (error) {
        console.warn('[UniqueLo] Supabase getProducts returned an error; using fallback seed data:', error);
      } else if (data && data.length > 0) {
        // Universe-schema feature detection: pre-migration rows lack universe_slug.
        // Serve them and they would leak the deprecated catalog (no universe/gender/
        // vibes) into the universe storefront — fall back to local mocks instead.
        if (!('universe_slug' in (data[0] as object))) {
          console.warn(
            '[UniqueLo] Supabase catalog predates the universe schema; using local mock catalog.',
          );
          return [...mockProducts];
        }
        return data.map((item: any) => {
          const emb = Array.isArray(item.embroidery_details)
            ? item.embroidery_details[0]
            : item.embroidery_details;

          return {
            slug: item.slug,
            name: item.name,
            subtitle: item.subtitle,
            description: item.description,
            foreignTagline: item.foreign_tagline,
            categorySlug: item.category_slug,
            universeSlug: item.universe_slug,
            garmentType: item.garment_type,
            gender: item.gender ?? 'unisex',
            motifId: item.motif_id,
            isMock: item.is_mock ?? false,
            handcrafted: item.handcrafted ?? false,
            vibes: item.vibes ?? [],
            moods: item.moods ?? [],
            tags: item.tags || [],
            featured: item.featured || false,
            customizable: item.customizable || false,
            material: item.material || [],
            care: item.care || [],
            fit: item.fit,
            batchNumber: item.batch_number,
            batchTotal: item.batch_total,
            craftRegion: item.craft_region,
            craftCluster: item.craft_cluster,
            fabricGsm: item.fabric_gsm,
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
            embroidery: emb
              ? {
                  technique: emb.technique,
                  techniqueLabel: emb.technique_label,
                  artisanHours: emb.artisan_hours,
                  placement: emb.placement || [],
                  threadComposition: emb.thread_composition,
                  motifStory: emb.motif_story,
                  macroImage: emb.macro_image_src
                    ? {
                        src: emb.macro_image_src,
                        alt: emb.macro_image_alt || item.name,
                      }
                    : undefined,
                }
              : undefined,
          };
        });
      }
    } catch (err) {
      console.warn('[UniqueLo] Exception querying Supabase products; using fallback seed data:', err);
    }
  }

  // Instant local seed fallback — mock render catalog (original 13 deprecated-retained)
  return [...mockProducts];
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

/** All active universes, ordered. Renders the Universes dropdown — never hardcode. */
export async function getUniverses(): Promise<Universe[]> {
  return [...seedUniverses]
    .filter((u) => u.is_active)
    .sort((a, b) => a.order - b.order);
}

export async function getUniverse(slug: string): Promise<Universe | undefined> {
  const universes = await getUniverses();
  return universes.find((u) => u.slug === slug);
}

/** Only IP-cleared motifs are ever returned. */
export async function getMotifsByUniverse(universeSlug: string): Promise<Motif[]> {
  return seedMotifs.filter((m) => m.universe_slug === universeSlug && m.ip_cleared);
}

export async function getMotif(id: string | undefined): Promise<Motif | undefined> {
  if (!id) return undefined;
  return seedMotifs.find((m) => m.id === id && m.ip_cleared);
}

/** Sync seed lookup for render-path use (no effect needed). Supabase-backed later. */
export function getMotifSync(id: string | undefined): Motif | undefined {
  if (!id) return undefined;
  return seedMotifs.find((m) => m.id === id && m.ip_cleared);
}

export async function getProductsByUniverse(universeSlug: string | 'all'): Promise<Product[]> {
  const products = await getProducts();
  if (universeSlug === 'all') return products;
  return products.filter((p) => p.universeSlug === universeSlug);
}

export function matchesGender(p: Product, gender: Gender | 'all'): boolean {
  if (gender === 'all') return true;
  const g = p.gender ?? 'unisex';
  return g === gender || g === 'unisex';
}

/** Men and Women surfaces both include `unisex` products. */
export async function getProductsByGender(gender: Gender | 'all'): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => matchesGender(p, gender));
}

/** Live counts for vibe/universe cards. Always COUNT(*) — never hardcode render numbers. */
export function countBy<T>(items: T[], key: (t: T) => string | undefined): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
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

    // Universe check
    if (filters.universeSlug && filters.universeSlug !== 'all' && product.universeSlug !== filters.universeSlug) {
      return false;
    }

    // Gender check (`unisex` matches both Men and Women)
    if (filters.gender && filters.gender !== 'all' && !matchesGender(product, filters.gender)) {
      return false;
    }

    // Garment-type check
    if (filters.garmentTypes && filters.garmentTypes.length > 0) {
      if (!product.garmentType || !filters.garmentTypes.includes(product.garmentType)) {
        return false;
      }
    }

    // Vibe discovery check
    if (filters.vibe && filters.vibe !== 'all') {
      if (!product.vibes || !product.vibes.includes(filters.vibe)) {
        return false;
      }
    }

    // Mood (buyer-intent) check
    if (filters.mood && filters.mood !== 'all') {
      if (!product.moods || !product.moods.includes(filters.mood)) {
        return false;
      }
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
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100));
}

export function getDefaultVariant(product: Product): ProductVariant {
  const inStock = product.variants?.find((v) => v.status === 'in-stock');
  if (inStock) return inStock;
  const lowStock = product.variants?.find((v) => v.status === 'low-stock');
  if (lowStock) return lowStock;
  const available = product.variants?.find((v) => v.status !== 'out-of-stock');
  if (available) return available;
  if (product.variants && product.variants.length > 0) return product.variants[0];
  return {
    sku: `${product.slug}-default`,
    color: 'Standard',
    colorHex: '#18181b',
    size: 'Standard',
    priceCents: 0,
    status: 'in-stock',
  };
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

export type PaymentMethod = 'upi' | 'cod' | 'card';

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pincode?: string;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  couponCode?: string | null;
  giftNote?: string | null;
  shippingAddress: string;
  lines: { productSlug: string; variantSku: string; productName: string; color: string; size: string; quantity: number; priceCents: number; customization?: CartCustomization }[];
}

export async function createOrder(input: CreateOrderInput): Promise<{ success: boolean; orderId?: string; message: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          status: input.paymentMethod === 'cod' ? 'confirmed-cod' : 'confirmed',
          subtotal_cents: input.subtotalCents,
          discount_cents: input.discountCents,
          shipping_cents: input.shippingCents,
          total_cents: input.totalCents,
          coupon_code: input.couponCode || null,
          gift_note: input.giftNote || null,
          shipping_address: {
            address: input.shippingAddress,
            phone: input.customerPhone || null,
            pincode: input.pincode || null,
            payment_method: input.paymentMethod,
          },
        })
        .select('id')
        .single();
      if (orderError) throw orderError;
      const orderId = (order as { id: string }).id;
      if (input.lines.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          input.lines.map((l) => ({
            order_id: orderId,
            product_slug: l.productSlug,
            variant_sku: l.variantSku,
            product_name: l.productName,
            color: l.color,
            size: l.size,
            quantity: l.quantity,
            price_cents: l.priceCents,
            customization: l.customization || null,
          }))
        );
        if (itemsError) throw itemsError;
      }
      return { success: true, orderId, message: 'Order placed successfully.' };
    } catch (err) {
      console.warn('[UniqueLo] createOrder failed:', err);
      return { success: false, message: 'Could not save order. Please try again or choose COD.' };
    }
  }
  // Dev fallback — no Supabase configured
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, orderId: `local-${Date.now()}`, message: 'Order confirmed (local mode).' };
}

// ─────────────────────────────────────────────────────────────────────
// Indian Craft Provenance Taxonomy (Stream 3)
// ─────────────────────────────────────────────────────────────────────

export interface CraftTechniqueInfo {
  slug: string;
  name: string;
  region: string;
  cluster: string;
  artisanPace: string;
  historicalContext: string;
  description: string;
  stitchType: string;
  image: string;
}

export const CRAFT_TECHNIQUES: CraftTechniqueInfo[] = [
  {
    slug: 'botanical-chain',
    name: 'Chikankari & Botanical Chain',
    region: 'Lucknow, Uttar Pradesh',
    cluster: 'Old City Needlework Collective',
    artisanPace: '14–20 hours per garment',
    historicalContext: 'Rooted in 16th-century Awadh patronage, Chikankari combines delicate shadow-work and tight chain looping using unbleached mulberry silk floss.',
    description: 'Fluid floral and vine geometries stitched with calibrated tension directly onto heavy organic cotton and washed canvas.',
    stitchType: 'Chain Stitch & Shadow Work',
    image: '/images/products/botanical-silk-jacket-2.png',
  },
  {
    slug: 'kantha-quilt',
    name: 'Kantha Running Needlework',
    region: 'Bolpur & Murshidabad, West Bengal',
    cluster: 'Shantiniketan Artisan Guild',
    artisanPace: '20–26 hours per garment',
    historicalContext: 'Centuries-old Bengali craft where layered handloom and vintage indigo fabrics are reinforced into structural quilts through rhythmic, parallel running stitches.',
    description: 'Thousands of close-set running stitches that bond multiple fabric layers together, yielding a distinctive crinkled, heirloom drape.',
    stitchType: 'Running Stitch & Quilt Bond',
    image: '/images/products/kantha-chore-jacket-2.jpg',
  },
  {
    slug: 'crewel-needlework',
    name: 'Kashmiri Crewel Needlecraft',
    region: 'Anantnag & Srinagar, Kashmir',
    cluster: 'Valley Aari Craftspersons',
    artisanPace: '18–24 hours per garment',
    historicalContext: 'Executed using a fine pointed aari hook, Kashmiri crewel work renders wild flora and alpine botanicals in thick 2-ply natural wool yarn.',
    description: 'Thick, dimensional wool embroidery on Mongolian cashmere and hand-woven wool coats that provides both tactile relief and natural insulation.',
    stitchType: 'Pointed Aari Hook Chain',
    image: '/images/products/crewel-cashmere-cardigan-2.png',
  },
  {
    slug: 'satin-stitch',
    name: 'High-Density Satin Needlecraft',
    region: 'Varanasi, Uttar Pradesh',
    cluster: 'Ghat Artisan Weavers',
    artisanPace: '12–16 hours per garment',
    historicalContext: 'Originating in classical handloom textile hubs, high-density satin stitching lays long, unbroken loops of mercerized thread edge-to-edge.',
    description: 'Creates a mirror-like textile sheen and dense color saturation that remains completely flat against the skin without backing irritation.',
    stitchType: 'Flat Satin Parallel Stitch',
    image: '/images/products/vine-heavyweight-tee-2.jpg',
  },
  {
    slug: 'sashiko-selvedge',
    name: 'Sashiko Structural Needlecraft',
    region: 'Kutch & Okayama Collaboration',
    cluster: 'Craft Textile Atelier',
    artisanPace: '16–22 hours per garment',
    historicalContext: 'Functional geometric needlework developed to reinforce heavy workwear textiles, combining Indian hand-dyeing with Japanese selvedge denim looms.',
    description: 'Crisp white cotton thread anchored in geometric lattices that strengthen high-friction zones and age with unique patina.',
    stitchType: 'Structural Geometric Grid',
    image: '/images/products/sashiko-selvedge-denim-2.jpg',
  },
  {
    slug: 'hand-zardozi',
    name: 'Hand Zardozi Wirework',
    region: 'Jaipur, Rajasthan',
    cluster: 'Pink City Bullion Guild',
    artisanPace: '28–34 hours per garment',
    historicalContext: 'Mughal-court gold sewing: coiled bullion wires and French spirals hand-anchored onto wool and silk. The atelier standard for bridal-grade relief.',
    description: 'Raised metallic relief with gilded wire, built to catch low light without losing tension.',
    stitchType: 'Anchor Bullion & Metallic Wire',
    image: '/images/products/celestial-zardozi-coat-2.png',
  },
  {
    slug: 'metallic-zari',
    name: 'Metallic Zari & Tilla',
    region: 'Varanasi & Surat',
    cluster: 'Ghat Zari Weavers Collective',
    artisanPace: '20–28 hours per garment',
    historicalContext: 'Silver-gilt zari cords couched with silk core along pleats and borders — temple and court textile lineage adapted to modern tailoring.',
    description: 'Continuous metallic inlay that holds pleat structure while adding heirloom sheen.',
    stitchType: 'Couched Metallic Cord',
    image: '/images/products/pleated-zari-trousers-2.jpg',
  },
  {
    slug: 'french-knot',
    name: 'French Knot Needlecraft',
    region: 'Kashmir & Kutch',
    cluster: 'Highland Knot Artisans',
    artisanPace: '14–18 hours per garment',
    historicalContext: 'Hand-wound spiral knots in merino and silk floss — pebble-grain texture that reads as sculpture up close and solid colour at distance.',
    description: 'Micro-sculpted knots delivering tactile dimension on knitwear and heavyweight jersey.',
    stitchType: 'Hand-Wound Spiral Knot',
    image: '/images/products/french-knot-turtleneck-2.jpg',
  },
  {
    slug: 'monogram-bespoke',
    name: 'Bespoke Monogram & Crest',
    region: 'Jaipur Atelier',
    cluster: 'Pink City Monogram Atelier',
    artisanPace: '6–10 hours per commission',
    historicalContext: 'Patron-initial satin work and crest embroidery — the atelier personalisation studio for shirts, scarves and heirloom linens.',
    description: 'Precision satin initials tailored to the patron, with archival thread and placement choice.',
    stitchType: 'Precision Satin Initial',
    image: '/images/products/monogram-poplin-shirt-2.jpg',
  },
];

export async function getCraftTechniques(): Promise<CraftTechniqueInfo[]> {
  return [...CRAFT_TECHNIQUES];
}

export async function getCraftTechnique(slug: string): Promise<CraftTechniqueInfo | undefined> {
  const normalized = slug === 'zardozi' ? 'hand-zardozi' : slug;
  return CRAFT_TECHNIQUES.find((c) => c.slug === normalized);
}
