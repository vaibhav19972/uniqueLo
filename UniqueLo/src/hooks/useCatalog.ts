import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getProducts,
  getProduct,
  getCategories,
  getFeaturedProducts,
  getAllColors,
  getAllSizes,
  getAllTechniques,
  getMaxPriceCents,
  getReviews,
  type Product,
  type Category,
  type Review,
  type EmbroideryTechnique,
} from '../lib/data';

export const catalogKeys = {
  products: ['catalog', 'products'] as const,
  product: (slug: string) => ['catalog', 'product', slug] as const,
  categories: ['catalog', 'categories'] as const,
  featured: (limit?: number) => ['catalog', 'featured', limit ?? 'all'] as const,
  colors: ['catalog', 'colors'] as const,
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

/** Featured products for the home reel */
export function useFeaturedProducts(limit?: number): UseQueryResult<Product[]> {
  return useQuery({ queryKey: catalogKeys.featured(limit), queryFn: () => getFeaturedProducts(limit) });
}

/** Unique variant colors across the catalog */
export function useAllColors(): UseQueryResult<{ name: string; hex: string }[]> {
  return useQuery({ queryKey: catalogKeys.colors, queryFn: getAllColors });
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