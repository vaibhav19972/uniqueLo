import { describe, expect, it } from 'vitest';
import { findUnavailableCartItems } from './data';
import type { CartItem, Product, ProductVariant } from './data';

/**
 * A stale persisted bag is not a hypothetical: it took the live storefront's
 * checkout down. `quote_order` refuses the whole bag on one unknown SKU, while
 * every visible list drops that same line, so the customer sees a normal bag, a
 * red error, and no line to delete. These tests pin the predicate the pruner and
 * the checkout page both rely on.
 */

function variant(sku: string, priceCents = 89900): ProductVariant {
  return {
    sku,
    color: 'Cream',
    colorHex: '#f2ece0',
    size: 'M',
    priceCents,
    status: 'in-stock',
  };
}

function product(slug: string, skus: string[]): Product {
  return {
    slug,
    name: slug,
    variants: skus.map((s) => variant(s)),
  } as Product;
}

function cartItem(productSlug: string, variantSku: string, id = `${productSlug}__${variantSku}`): CartItem {
  return { id, productSlug, variantSku, quantity: 1 };
}

const catalogue: Product[] = [
  product('ivory-hoodie', ['UL-H4B0-CREAM-M', 'UL-H4B0-CREAM-L']),
  product('ascendant-cream-tee', ['UL-TC51-ECRU-M']),
];

describe('findUnavailableCartItems', () => {
  it('T-C1 keeps a bag whose SKUs all exist', () => {
    const items = [
      cartItem('ivory-hoodie', 'UL-H4B0-CREAM-M'),
      cartItem('ascendant-cream-tee', 'UL-TC51-ECRU-M'),
    ];
    expect(findUnavailableCartItems(items, catalogue)).toEqual([]);
  });

  it('T-C2 flags a SKU the catalogue does not carry', () => {
    // The exact production failure: an Admin-matrix-shaped SKU in a persisted cart.
    const stale = cartItem('ivory-hoodie', 'ihdl-nat-s');
    const items = [cartItem('ivory-hoodie', 'UL-H4B0-CREAM-M'), stale];
    expect(findUnavailableCartItems(items, catalogue)).toEqual([stale]);
  });

  it('T-C3 flags a line whose product is gone, not just its variant', () => {
    const stale = cartItem('retired-hoodie', 'UL-H4B0-CREAM-M');
    expect(findUnavailableCartItems([stale], catalogue)).toEqual([stale]);
  });

  it('T-C4 flags the right line when one product has several variants', () => {
    const stale = cartItem('ivory-hoodie', 'UL-H4B0-CREAM-XS');
    const items = [
      cartItem('ivory-hoodie', 'UL-H4B0-CREAM-M'),
      stale,
      cartItem('ivory-hoodie', 'UL-H4B0-CREAM-L'),
    ];
    expect(findUnavailableCartItems(items, catalogue)).toEqual([stale]);
  });

  it('T-C5 never prunes when the catalogue has not loaded', () => {
    // An empty list means "fetch pending or failed", not "nothing is available".
    // Pruning on it would empty a valid bag on a dropped request.
    const items = [cartItem('ivory-hoodie', 'UL-H4B0-CREAM-M')];
    expect(findUnavailableCartItems(items, [])).toEqual([]);
  });

  it('T-C6 is case-sensitive about SKUs, like the database', () => {
    // `variants.sku` is a primary key compared with `=`; a case-insensitive match
    // here would keep a line the server will still refuse.
    const stale = cartItem('ivory-hoodie', 'ul-h4b0-cream-m');
    expect(findUnavailableCartItems([stale], catalogue)).toEqual([stale]);
  });

  it('T-C7 returns every stale line, so one bulk removal can clear them', () => {
    const items = [
      cartItem('ivory-hoodie', 'ihdl-nat-s'),
      cartItem('ivory-hoodie', 'UL-H4B0-CREAM-M'),
      cartItem('gone-product', 'whatever'),
    ];
    const stale = findUnavailableCartItems(items, catalogue);
    expect(stale).toHaveLength(2);
    expect(stale.map((i) => i.variantSku)).toEqual(['ihdl-nat-s', 'whatever']);
  });
});
