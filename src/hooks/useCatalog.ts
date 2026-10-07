import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getProducts,
  getCategories,
  getFeaturedProducts,
  getAllColors,
  getAllSizes,
  getMaxPriceCents,
  type Product,
  type Category,
} from '../lib/data';

export const catalogKeys = {
  products: ['catalog', 'products'] as const,
  categories: ['catalog', 'categories'] as const,
  featured: (limit?: number) => ['catalog', 'featured', limit ?? 'all'] as const,
  colors: ['catalog', 'colors'] as const,
  sizes: ['catalog', 'sizes'] as const,
  maxPrice: ['catalog', 'maxPrice'] as const,
};

/** All products (cache source for cart-line resolution, shop grid, etc.) */
export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({ queryKey: catalogKeys.products, queryFn: getProducts });
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

/** Maximum variant price across the catalog */
export function useMaxPriceCents(): UseQueryResult<number> {
  return useQuery({ queryKey: catalogKeys.maxPrice, queryFn: getMaxPriceCents });
}