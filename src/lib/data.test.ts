import { describe, expect, it, vi } from 'vitest';

// Force the offline path: no Supabase client, so catalogue reads fall back to
// the bundled JSON. Mirrors the documented fallback contract (docs/10-testing).
vi.mock('./supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
  shouldUseSupabaseReads: () => false,
}));

import { filterProducts, formatPrice, getProducts, resolveImageUrl } from './data';
import type { FilterState } from './data';

const base: FilterState = {
  categorySlug: 'all',
  colors: [],
  sizes: [],
  sort: 'newest',
};

describe('catalogue data spine', () => {
  it('T1.1 serves a coherent fallback catalogue', async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);

    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const p of products) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.name).toBeTruthy();
      expect(p.categorySlug).toBeTruthy();
      expect(p.variants.length).toBeGreaterThan(0);
      for (const v of p.variants) {
        expect(v.sku).toBeTruthy();
        expect(v.size).toBeTruthy();
        expect(v.priceCents).toBeGreaterThan(0);
      }
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.images.every((i) => Boolean(i.src) && Boolean(i.alt))).toBe(true);
      // The mock flag was retired 2026-10-25; nothing may reintroduce it.
      expect('isMock' in p).toBe(false);
    }
  });

  it('T1.2 formats paise as grouped INR with no decimals', () => {
    expect(formatPrice(149900)).toBe('₹1,499');
    expect(formatPrice(1234567)).toBe('₹12,346');
    expect(formatPrice(0)).toBe('₹0');
  });

  it('T1.3 filters are conjunctive and return [] rather than throwing', async () => {
    const products = await getProducts();
    expect(filterProducts(products, base).length).toBe(products.length);

    expect(
      filterProducts(products, { ...base, universeSlug: 'no-such-universe' }),
    ).toEqual([]);

    const universe = products.find((p) => p.universeSlug)?.universeSlug;
    if (universe) {
      const scoped = filterProducts(products, { ...base, universeSlug: universe });
      expect(scoped.length).toBeGreaterThan(0);
      expect(scoped.every((p) => p.universeSlug === universe)).toBe(true);
    }
  });

  it('T1.4 image sources pass through; empty falls back to the placeholder', () => {
    expect(resolveImageUrl('https://cdn.example/x.jpg')).toBe('https://cdn.example/x.jpg');
    expect(resolveImageUrl('')).toBe('/images/placeholders/hero.jpg');
  });
});
