import rawCategories from '../data/categories.json';
import rawMockProducts from '../data/mock-products.json';
import rawUniverses from '../data/universes.json';
import rawMotifs from '../data/motifs.json';
import rawEdits from '../data/edits.json';
import rawIntensity from '../data/intensity.json';
import rawExpression from '../data/expression.json';
import rawCraft from '../data/craft-techniques.json';
import rawCollections from '../data/collections.json';
import rawGarments from '../data/garments.json';
import { supabase, isSupabaseConfigured, shouldUseSupabaseReads } from './supabase';

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type Currency = 'INR';

/**
 * Expression score (1-5): signature UniqueLo discovery axis describing
 * the visual prominence, coverage, and intensity of the embroidery.
 */
export type ExpressionScore = 1 | 2 | 3 | 4 | 5;

export type ExpressionSlug =
  | 'minimal'
  | 'subtle-statements'
  | 'artistic'
  | 'bold-statements'
  | 'elaborate-intricate';

export interface ExpressionInfo {
  score: ExpressionScore;
  slug: ExpressionSlug;
  name: string;
  tagline: string;
  description: string;
  characteristics: string;
  order: number;
}

/** Gender taxonomy: `unisex` matches BOTH Men and Women surfaces. */
export type Gender = 'men' | 'women' | 'unisex';

/**
 * CollectionSlug = seasonal drop or thematic capsule identity.
 * Registry: src/data/collections.json — spring-sakura, royal-heritage, midnight-atelier.
 * Cross-category: groups hoodies, tees, jackets, scarves sharing one design drop.
 */
export type CollectionSlug =
  | 'spring-sakura'
  | 'royal-heritage'
  | 'midnight-atelier'
  | string;

export interface CollectionInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  universeSlug?: string;
  featured?: boolean;
  order: number;
}

/** @deprecated Use CollectionSlug */
export type ArtStyleSlug = CollectionSlug;

/** @deprecated Use CollectionInfo */
export type ArtStyleInfo = CollectionInfo;

export interface GarmentInfo {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  order: number;
}

/**
 * Intensity = how loudly a piece wears its world — the Minimalist↔Expressive
 * polarity as a shoppable 3-stop axis. Registry: src/data/intensity.json.
 */
export type IntensityLevel = 'quiet' | 'balanced' | 'loud';

/**
 * Edit = curated, shoppable collection (buyer intent promoted to campaigns).
 * Registry: src/data/edits.json — moods were folded into it.
 */
export type EditSlug = 'everyday' | 'statement' | 'heritage' | 'festive-gifting' | 'comfort' | 'collector';

export interface EditInfo {
  slug: EditSlug;
  title: string;
  tagline: string;
  featured: boolean;
  order: number;
}

export interface IntensityInfo {
  slug: IntensityLevel;
  name: string;
  tagline: string;
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
  hero_image?: string;
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
  /** Fulfillment-only SKU identity — never a shoppable option (no colour picker). */
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
  /** Universe this product belongs to (optional — null = Atelier base line). */
  universeSlug?: string;
  /** Garment type facet, registry-driven (src/data/garments.json). */
  garmentType?: string;
  /** Gender facet. `unisex` appears under both Men and Women. */
  gender?: Gender;
  /** Character lore link (motifs.json id — the browsable character). */
  motifId?: string;
  /** Forward-compat multi-character membership; single-motif rows read as [motifId]. */
  characterIds?: string[];
  /** Collection drop membership (src/data/collections.json & public.collections). */
  collectionSlug?: string;
  /** Genre art direction / Collection (backward compatibility). One per product. */
  artStyleSlug?: ArtStyleSlug;
  /**
   * Intensity stop: how loudly this piece wears its world. Products without
   * an explicit value read as `balanced` (axis midpoint).
   */
  intensity?: IntensityLevel;
  /**
   * Expression score (1-5): signature UniqueLo discovery axis describing
   * the visual prominence, coverage, and intensity of the embroidery.
   */
  expressionScore?: ExpressionScore;
  /** Expression slug (minimal, subtle-statements, artistic, bold-statements, elaborate-intricate). */
  expressionSlug?: ExpressionSlug;
  /**
   * Craft techniques on this piece (1+ slugs from craft-techniques.json).
   * PDP provenance + optional refinement facet — never the primary axis.
   */
  craftTechniques?: EmbroideryTechnique[];
  /**
   * Curated Edit memberships (1–3 slugs from src/data/edits.json).
   * Powers the Edits gateway + edit facet — never rendering.
   */
  edits?: EditSlug[];
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
  universeSlug?: string | 'all' | 'atelier';
  gender?: Gender | 'all';
  garmentTypes?: string[];
  intensity?: IntensityLevel | 'all';
  expressionSlug?: ExpressionSlug | 'all';
  expressionScore?: ExpressionScore | 'all';
  characterId?: string | 'all';
  collectionSlug?: CollectionSlug | 'all';
  /** @deprecated Use collectionSlug */
  artStyleSlug?: ArtStyleSlug | 'all';
  edit?: EditSlug | 'all';
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
// NOTE: the old src/data/products.json (original 13) was deleted 2026-10-12.
// The storefront runs on mock-products.json until real SKUs land.
const mockProducts: Product[] = (rawMockProducts as { products: Product[] }).products;
const seedUniverses: Universe[] = (rawUniverses as { universes: Universe[] }).universes;
const seedMotifs: Motif[] = (rawMotifs as { motifs: Motif[] }).motifs;

/** Edits registry (sorted by order) — curated shoppable collections. */
export const EDITS: EditInfo[] = ((rawEdits as { edits: EditInfo[] }).edits)
  .slice()
  .sort((a, b) => a.order - b.order);

/** Intensity registry (sorted by order) — the Quiet↔Loud shopping axis. */
export const INTENSITY_LEVELS: IntensityInfo[] = ((rawIntensity as { intensityLevels: IntensityInfo[] }).intensityLevels)
  .slice()
  .sort((a, b) => a.order - b.order);

/** Effective intensity with the balanced-midpoint default applied. */
export function getIntensity(p: Product | undefined): IntensityLevel {
  return p?.intensity ?? 'balanced';
}

/** Expression registry (sorted by score 1–5) — signature UniqueLo discovery axis. */
export const EXPRESSION_LEVELS: ExpressionInfo[] = (
  (rawExpression as { expressionLevels: ExpressionInfo[] }).expressionLevels
)
  .slice()
  .sort((a, b) => a.order - b.order);

/** Lookup expression level info by numeric score (1–5) */
export function getExpressionByScore(score: number | undefined): ExpressionInfo | undefined {
  if (score == null) return undefined;
  return EXPRESSION_LEVELS.find((e) => e.score === score);
}

/** Lookup expression level info by slug */
export function getExpressionBySlug(slug: string | undefined): ExpressionInfo | undefined {
  if (!slug) return undefined;
  return EXPRESSION_LEVELS.find((e) => e.slug === slug);
}

/** Effective expression score with fallback from intensity or default (3 - Artistic) */
export function getExpressionScore(p: Product | undefined): ExpressionScore {
  if (p?.expressionScore) return p.expressionScore;
  if (p?.intensity === 'quiet') return 1;
  if (p?.intensity === 'loud') return 4;
  return 3;
}

export async function getExpressions(): Promise<ExpressionInfo[]> {
  return EXPRESSION_LEVELS;
}

export async function getExpression(slug: string): Promise<ExpressionInfo | undefined> {
  return getExpressionBySlug(slug);
}

/** Collections registry (seasonal drops & aesthetic capsules). */
export const COLLECTIONS: CollectionInfo[] = (
  (rawCollections as { collections: CollectionInfo[] }).collections
)
  .slice()
  .sort((a, b) => a.order - b.order);

/** @deprecated Use COLLECTIONS */
export const ART_STYLES: CollectionInfo[] = COLLECTIONS;

/** Garment registry (merchandise types — what the thing is). */
export const GARMENTS: GarmentInfo[] = (
  (rawGarments as { garments: GarmentInfo[] }).garments
)
  .slice()
  .sort((a, b) => a.order - b.order);

/** Characters linked to a product (multi-id forward-compat). */
export function getCharacterIds(p: Product | undefined): string[] {
  if (!p) return [];
  if (p.characterIds?.length) return p.characterIds;
  return p.motifId ? [p.motifId] : [];
}

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
};

// ─────────────────────────────────────────────────────────────────────
// Data API with Supabase + Local Fallback Seam
// ─────────────────────────────────────────────────────────────────────

export function resolveImageUrl(src: string): string {
  if (!src) return '/images/placeholders/hero.jpg';
  return src;
}

export async function getProducts(): Promise<Product[]> {
  if (shouldUseSupabaseReads() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          slug, name, subtitle, description, foreign_tagline, category_slug, universe_slug, collection_slug, garment_type, gender, motif_id, character_ids, art_style_slug, intensity, is_mock, handcrafted, craft_techniques, edits, rating, review_count, sold_count, tags, featured, customizable, material, care, fit, batch_number, batch_total, craft_region, craft_cluster, fabric_gsm,
          variants (sku, color, color_hex, size, price_cents, compare_at_price_cents, status, quantity),
          product_images (src, alt, color, sort_order),
          embroidery_details (technique, technique_label, artisan_hours, placement, thread_composition, motif_story, macro_image_src, macro_image_alt)
        `)
        .eq('is_mock', true); // legacy migrated rows must never leak to the storefront

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
            collectionSlug: item.collection_slug ?? item.art_style_slug,
            garmentType: item.garment_type,
            gender: item.gender ?? 'unisex',
            motifId: item.motif_id,
            characterIds: item.character_ids ?? (item.motif_id ? [item.motif_id] : []),
            artStyleSlug: item.collection_slug ?? item.art_style_slug,
            intensity: item.intensity ?? 'balanced',
            isMock: item.is_mock ?? false,
            handcrafted: item.handcrafted ?? false,
            craftTechniques: item.craft_techniques ?? [],
            edits: item.edits ?? [],
            rating: item.rating,
            reviewCount: item.review_count,
            soldCount: item.sold_count,
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
  if (shouldUseSupabaseReads() && supabase) {
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

/** Only IP-cleared characters are ever returned (motifs = characters). */
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

/** Character aliases — motifs ARE the browsable characters. */
export const getCharactersByUniverse = getMotifsByUniverse;
export const getCharacter = getMotif;
export const getCharacterSync = getMotifSync;

export async function getAllCharacters(): Promise<Motif[]> {
  return seedMotifs.filter((m) => m.ip_cleared);
}

export async function getCollections(): Promise<CollectionInfo[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('order_num', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          slug: c.slug,
          name: c.name,
          tagline: c.tagline || '',
          description: c.description || '',
          universeSlug: c.universe_slug,
          featured: c.featured ?? true,
          order: c.order_num ?? 0,
        }));
      }
    } catch {
      // Fallback to local taxonomy
    }
  }
  return [...COLLECTIONS];
}

export async function getCollection(slug: string): Promise<CollectionInfo | undefined> {
  const list = await getCollections();
  return list.find((c) => c.slug === slug);
}

/** @deprecated Use getCollections() */
export async function getArtStyles(): Promise<CollectionInfo[]> {
  return getCollections();
}

/** @deprecated Use getCollection() */
export async function getArtStyle(slug: string): Promise<CollectionInfo | undefined> {
  return getCollection(slug);
}

export async function getGarments(): Promise<GarmentInfo[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .order('order_num', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((g: any) => ({
          slug: g.slug,
          name: g.name,
          categorySlug: g.category_slug,
          description: g.description,
          order: g.order_num ?? 0,
        }));
      }
    } catch {
      // Fallback to local taxonomy
    }
  }
  return [...GARMENTS];
}

export async function getGarment(slug: string): Promise<GarmentInfo | undefined> {
  const list = await getGarments();
  return list.find((g) => g.slug === slug);
}

export async function getProductsByCharacter(characterId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => getCharacterIds(p).includes(characterId));
}

export async function getProductsByArtStyle(styleSlug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.artStyleSlug === styleSlug);
}

export async function getProductsByGarment(garmentSlug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.garmentType === garmentSlug);
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
    for (const t of p.craftTechniques?.length
      ? p.craftTechniques
      : p.embroidery
        ? [p.embroidery.technique]
        : []) {
      const label = CRAFT_TECHNIQUES.find((c) => c.slug === t)?.name ?? p.embroidery?.techniqueLabel;
      if (label && !map.has(t)) map.set(t, label);
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

    // Universe check ('atelier' = the neutral base line: universe-null products)
    if (filters.universeSlug && filters.universeSlug !== 'all') {
      const inUniverse = filters.universeSlug === 'atelier'
        ? product.universeSlug == null
        : product.universeSlug === filters.universeSlug;
      if (!inUniverse) return false;
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

    // Character check (motif/character own pages)
    if (filters.characterId && filters.characterId !== 'all') {
      if (!getCharacterIds(product).includes(filters.characterId)) return false;
    }

    // Collection / Art-style check (seasonal drops & aesthetic capsules)
    const activeCollection = filters.collectionSlug ?? filters.artStyleSlug;
    if (activeCollection && activeCollection !== 'all') {
      const pColl = product.collectionSlug ?? product.artStyleSlug;
      if (pColl !== activeCollection) return false;
    }

    // Intensity check (products default to the balanced midpoint)
    if (filters.intensity && filters.intensity !== 'all') {
      if (getIntensity(product) !== filters.intensity) return false;
    }

    // Expression check (signature 1-5 scale discovery axis)
    if (filters.expressionSlug && filters.expressionSlug !== 'all') {
      const pSlug = product.expressionSlug ?? getExpressionByScore(product.expressionScore)?.slug;
      if (pSlug !== filters.expressionSlug) return false;
    }

    if (filters.expressionScore && filters.expressionScore !== 'all') {
      const pScore = getExpressionScore(product);
      if (pScore !== filters.expressionScore) return false;
    }

    // Edit (curated collection) check
    if (filters.edit && filters.edit !== 'all') {
      if (!product.edits || !product.edits.includes(filters.edit)) return false;
    }

    // Craft-technique check — matches the craftTechniques[] facet or the
    // embroidery block, so rows predating the new schema still filter.
    if (filters.techniques && filters.techniques.length > 0) {
      const productTechs = product.craftTechniques?.length
        ? product.craftTechniques
        : product.embroidery
          ? [product.embroidery.technique]
          : [];
      if (!filters.techniques.some((t) => productTechs.includes(t))) return false;
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
      const matchStyle = (product.artStyleSlug ?? '').toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchDesc && !matchTag && !matchTech && !matchStyle) {
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
  if (shouldUseSupabaseReads() && supabase) {
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

export const CRAFT_TECHNIQUES: CraftTechniqueInfo[] = (rawCraft as unknown as CraftTechniqueInfo[]);

export async function getCraftTechniques(): Promise<CraftTechniqueInfo[]> {
  return [...CRAFT_TECHNIQUES];
}

export async function getCraftTechnique(slug: string): Promise<CraftTechniqueInfo | undefined> {
  const normalized = slug === 'zardozi' ? 'hand-zardozi' : slug;
  return CRAFT_TECHNIQUES.find((c) => c.slug === normalized);
}
