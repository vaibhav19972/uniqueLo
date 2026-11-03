import { describe, expect, it, beforeEach } from 'vitest';
import { useQuickViewStore } from './quickView';
import type { Product } from '../lib/data';

const mockProduct: Product = {
  slug: 'test-oversized-tee',
  name: 'Test Oversized Tee',
  subtitle: 'Heavyweight Cotton Tee',
  categorySlug: 'tops',
  gender: 'unisex',
  tags: ['oversized', 'tee'],
  featured: true,
  images: [{ src: '/images/test.jpg', alt: 'Test' }],
  variants: [
    {
      sku: 'SKU-001-M',
      size: 'M',
      color: 'Washed Black',
      colorHex: '#1f1f1f',
      priceCents: 149900,
      status: 'in-stock',
    },
  ],
  description: 'A test oversized boxy tee.',
  countryOfOrigin: 'India',
  returnWindowDays: 7,
  codAvailable: true,
};

describe('useQuickViewStore', () => {
  beforeEach(() => {
    useQuickViewStore.setState({
      isOpen: false,
      product: null,
    });
  });

  it('opens quick view with the given product', () => {
    useQuickViewStore.getState().openQuickView(mockProduct);

    const state = useQuickViewStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.product?.slug).toBe('test-oversized-tee');
  });

  it('closes quick view and clears product', () => {
    useQuickViewStore.getState().openQuickView(mockProduct);
    expect(useQuickViewStore.getState().isOpen).toBe(true);

    useQuickViewStore.getState().closeQuickView();

    const state = useQuickViewStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.product).toBeNull();
  });
});
