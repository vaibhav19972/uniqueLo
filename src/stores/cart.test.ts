import { describe, expect, it, beforeEach } from 'vitest';
import { useCartStore } from './cart';

describe('useCartStore expressItem isolation', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      expressItem: null,
      isOpen: false,
    });
  });

  it('sets expressItem without modifying regular cart items', () => {
    // Regular item in cart
    useCartStore.getState().addItem('tee-slug', 'SKU-TEE-M', 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    // Express buy a hoodie
    useCartStore.getState().setExpressItem('hoodie-slug', 'SKU-HOODIE-L', 1);

    // Express item is set
    const expressItem = useCartStore.getState().expressItem;
    expect(expressItem).not.toBeNull();
    expect(expressItem?.productSlug).toBe('hoodie-slug');
    expect(expressItem?.variantSku).toBe('SKU-HOODIE-L');
    expect(expressItem?.quantity).toBe(1);

    // Cart drawer is kept closed
    expect(useCartStore.getState().isOpen).toBe(false);

    // Regular cart items remain completely untouched!
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantSku).toBe('SKU-TEE-M');
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('clearing express item does not clear normal cart', () => {
    useCartStore.getState().addItem('tee-slug', 'SKU-TEE-M', 1);
    useCartStore.getState().setExpressItem('hoodie-slug', 'SKU-HOODIE-L', 1);

    useCartStore.getState().clearExpressItem();

    expect(useCartStore.getState().expressItem).toBeNull();
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productSlug).toBe('tee-slug');
  });
});

