import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getProducts,
  getProduct,
  getCategories,
  getUniverses,
  getUniverse,
  getMotifsByUniverse,
  getMotif,
  getAllCharacters,
  getArtStyles,
  getArtStyle,
  getGarments,
  getExpressions,
  getExpression,
  getFeaturedProducts,
  getAllSizes,
  getAllTechniques,
  getMaxPriceCents,
  getReviews,
  type Product,
  type Category,
  type Universe,
  type Motif,
  type Review,
  type EmbroideryTechnique,
  type ArtStyleInfo,
  type GarmentInfo,
  type ExpressionInfo,
} from '../lib/data';

export const catalogKeys = {
  products: ['catalog', 'products'] as const,
  product: (slug: string) => ['catalog', 'product', slug] as const,
  categories: ['catalog', 'categories'] as const,
  universes: ['catalog', 'universes'] as const,
  universe: (slug: string) => ['catalog', 'universe', slug] as const,
  motifs: (universeSlug: string) => ['catalog', 'motifs', universeSlug] as const,
  character: (id: string) => ['catalog', 'character', id] as const,
  characters: ['catalog', 'characters'] as const,
  artStyles: ['catalog', 'artStyles'] as const,
  artStyle: (slug: string) => ['catalog', 'artStyle', slug] as const,
  garments: ['catalog', 'garments'] as const,
  featured: (limit?: number) => ['catalog', 'featured', limit ?? 'all'] as const,
  sizes: ['catalog', 'sizes'] as const,
  techniques: ['catalog', 'techniques'] as const,
  maxPrice: ['catalog', 'maxPrice'] as const,
  reviews: (slug: string) => ['catalog', 'reviews', slug] as const,
};

/** All products */
export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({ queryKey: catalogKeys.products, queryFn: getProducts });
}

/** Single product by slug */
export function useProduct(slug: string | undefined): UseQueryResult<Product | undefined> {
  return useQuery({
    queryKey: catalogKeys.product(slug || ''),
    queryFn: () => (slug ? getProduct(slug) : Promise.resolve(undefined)),
    enabled: Boolean(slug),
  });
}

/** All categories, ordered */
export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryKey: catalogKeys.categories, queryFn: getCategories });
}

/** All active universes, ordered — drives nav + portals, never hardcoded */
export function useUniverses(): UseQueryResult<Universe[]> {
  return useQuery({ queryKey: catalogKeys.universes, queryFn: getUniverses });
}

/** Single universe by slug */
export function useUniverse(slug: string | undefined): UseQueryResult<Universe | undefined> {
  return useQuery({
    queryKey: catalogKeys.universe(slug || ''),
    queryFn: () => (slug ? getUniverse(slug) : Promise.resolve(undefined)),
    enabled: Boolean(slug),
  });
}

/** IP-cleared motifs for a universe (lore strip + character pages) */
export function useMotifsByUniverse(universeSlug: string | undefined): UseQueryResult<Motif[]> {
  return useQuery({
    queryKey: catalogKeys.motifs(universeSlug || ''),
    queryFn: () => (universeSlug ? getMotifsByUniverse(universeSlug) : Promise.resolve([])),
    enabled: Boolean(universeSlug),
  });
}

/** Single character (motif) by id — powers /universes/:slug/characters/:id. */
export function useCharacter(id: string | undefined): UseQueryResult<Motif | undefined> {
  return useQuery({
    queryKey: catalogKeys.character(id || ''),
    queryFn: () => (id ? getMotif(id) : Promise.resolve(undefined)),
    enabled: Boolean(id),
  });
}

/** All characters across universes. */
export function useAllCharacters(): UseQueryResult<Motif[]> {
  return useQuery({ queryKey: catalogKeys.characters, queryFn: getAllCharacters });
}

/** Art-style registry (genre art direction doors). */
export function useArtStyles(): UseQueryResult<ArtStyleInfo[]> {
  return useQuery({ queryKey: catalogKeys.artStyles, queryFn: getArtStyles });
}

export function useArtStyle(slug: string | undefined): UseQueryResult<ArtStyleInfo | undefined> {
  return useQuery({
    queryKey: catalogKeys.artStyle(slug || ''),
    queryFn: () => (slug ? getArtStyle(slug) : Promise.resolve(undefined)),
    enabled: Boolean(slug),
  });
}

/** Garment registry (merchandise doors). */
export function useGarments(): UseQueryResult<GarmentInfo[]> {
  return useQuery({ queryKey: catalogKeys.garments, queryFn: getGarments });
}

/** Expression registry (signature 1-5 scale discovery axis). */
export function useExpressions(): UseQueryResult<ExpressionInfo[]> {
  return useQuery({
    queryKey: ['catalog', 'expressions'],
    queryFn: getExpressions,
  });
}

export function useExpression(slug: string | undefined): UseQueryResult<ExpressionInfo | undefined> {
  return useQuery({
    queryKey: ['catalog', 'expression', slug || ''],
    queryFn: () => (slug ? getExpression(slug) : Promise.resolve(undefined)),
    enabled: Boolean(slug),
  });
}

/** Featured products for the home reel */
export function useFeaturedProducts(limit?: number): UseQueryResult<Product[]> {
  return useQuery({ queryKey: catalogKeys.featured(limit), queryFn: () => getFeaturedProducts(limit) });
}

/** Unique variant sizes across the catalog */
export function useAllSizes(): UseQueryResult<string[]> {
  return useQuery({ queryKey: catalogKeys.sizes, queryFn: getAllSizes });
}

/** Unique embroidery techniques across the catalog */
export function useAllTechniques(): UseQueryResult<{ technique: EmbroideryTechnique; label: string }[]> {
  return useQuery({ queryKey: catalogKeys.techniques, queryFn: getAllTechniques });
}

/** Maximum variant price across the catalog */
export function useMaxPriceCents(): UseQueryResult<number> {
  return useQuery({ queryKey: catalogKeys.maxPrice, queryFn: getMaxPriceCents });
}

/** Customer reviews for a product */
export function useReviews(slug: string | undefined): UseQueryResult<Review[]> {
  return useQuery({
    queryKey: catalogKeys.reviews(slug || ''),
    queryFn: () => (slug ? getReviews(slug) : Promise.resolve([])),
    enabled: Boolean(slug),
  });
}

/** Indian craft technique taxonomy */
export function useCraftTechniques() {
  return useQuery({
    queryKey: ['catalog', 'craftTechniques'],
    queryFn: () => import('../lib/data').then((m) => m.getCraftTechniques()),
  });
}

export function useCraftTechnique(slug: string | undefined) {
  return useQuery({
    queryKey: ['catalog', 'craftTechnique', slug || ''],
    queryFn: () => import('../lib/data').then((m) => (slug ? m.getCraftTechnique(slug) : undefined)),
    enabled: Boolean(slug),
  });
}
