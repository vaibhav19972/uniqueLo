import { describe, expect, it, vi } from 'vitest';

// Two clients behave differently here and both matter:
//  - unconfigured: no pricing authority exists, so we must refuse to guess
//  - configured: every number comes from the RPC payload, verbatim
const rpc = vi.fn();
let configured = false;

vi.mock('./supabase', () => ({
  get supabase() {
    return configured ? { rpc } : null;
  },
  isSupabaseConfigured: () => configured,
  shouldUseSupabaseReads: () => configured,
}));

import {
  quoteOrder,
  QuoteError,
  UnknownVariantError,
  parseUnknownVariant,
  lineMrpCents,
  lineDiscountPercent,
  catalogMrp,
  remainingForFreeShipping,
  freeShippingProgress,
  type Quote,
} from './pricing';

const line = (over: Partial<Quote['lines'][0]> = {}) => ({
  sku: 'HOOD-M',
  product_slug: 'ivory-hoodie',
  color: 'Ivory',
  size: 'M',
  quantity: 1,
  unit_price_cents: 149900,
  line_total_cents: 149900,
  compare_at_cents: null as number | null,
  stock_available: 10,
  ...over,
});

const quote = (over: Partial<Quote> = {}): Quote => ({
  lines: [line()],
  units: 1,
  subtotal_cents: 149900,
  discount_cents: 0,
  shipping_cents: 0,
  cod_fee_cents: 0,
  total_cents: 149900,
  free_shipping_threshold_cents: 149900,
  flat_rate_cents: 9900,
  cod_max_units: 10,
  payment_method: 'prepaid',
  coupon: null,
  best_coupon: null,
  savings_cents: 0,
  ...over,
});

describe('pricing — the bag may not invent a number', () => {
  it('P1.1 refuses to price when there is no backend', async () => {
    configured = false;
    await expect(quoteOrder({ items: [{ variant_sku: 'HOOD-M', quantity: 1 }] })).rejects.toThrow(
      QuoteError
    );
    await expect(
      quoteOrder({ items: [{ variant_sku: 'HOOD-M', quantity: 1 }] })
    ).rejects.toMatchObject({ code: 'NO_BACKEND' });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('P1.2 reports an undeployed RPC as such, not as a generic failure', async () => {
    configured = true;
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST202', message: 'Could not find the function public.quote_order' },
    });
    await expect(
      quoteOrder({ items: [{ variant_sku: 'HOOD-M', quantity: 1 }] })
    ).rejects.toMatchObject({ code: 'NOT_DEPLOYED' });
  });

  // The live storefront's checkout died on exactly this: one stale SKU in a
  // persisted bag makes quote_order refuse the WHOLE cart, and the raw Postgres
  // message was what the customer saw. It has to arrive typed and parsed so the
  // page can drop that line instead of blacklisting checkout.
  it('P1.2b surfaces an uncatalogued SKU as UnknownVariantError naming the SKU', async () => {
    configured = true;
    rpc.mockResolvedValueOnce({
      data: null,
      error: {
        code: 'P0002',
        message: 'Unknown or uncatalogued variant SKU: ihdl-nat-s',
      },
    });

    const err = await quoteOrder({ items: [{ variant_sku: 'ihdl-nat-s', quantity: 1 }] }).catch(
      (e) => e
    );
    expect(err).toBeInstanceOf(UnknownVariantError);
    expect(err).toBeInstanceOf(QuoteError);
    expect(err.code).toBe('UNKNOWN_VARIANT');
    expect(err.sku).toBe('ihdl-nat-s');
  });

  it('P1.2c leaves a P0002 it cannot parse as a plain QuoteError', async () => {
    // A different raise in the same SQLSTATE must not be mistaken for a bad SKU:
    // the caller would then remove a line that was never the problem.
    configured = true;
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'P0002', message: 'no_data_found' },
    });
    await expect(
      quoteOrder({ items: [{ variant_sku: 'HOOD-M', quantity: 1 }] })
    ).rejects.toMatchObject({ code: 'P0002' });
  });

  it('P1.2d parses the SKU out of the server message, and only when present', () => {
    expect(parseUnknownVariant('Unknown or uncatalogued variant SKU: ihdl-nat-s')).toBe('ihdl-nat-s');
    expect(parseUnknownVariant('Unknown or uncatalogued variant SKU: UL-H4B0-CREAM-M')).toBe(
      'UL-H4B0-CREAM-M'
    );
    // Not a shape this parser claims to understand — must not invent one.
    expect(parseUnknownVariant('no_data_found')).toBeNull();
    expect(parseUnknownVariant(undefined)).toBeNull();
    expect(parseUnknownVariant('')).toBeNull();
  });

  it('P1.3 passes the coupon and payment method through untouched', async () => {
    configured = true;
    rpc.mockResolvedValueOnce({ data: quote(), error: null });
    await quoteOrder({
      items: [{ variant_sku: 'HOOD-M', quantity: 2 }],
      couponCode: 'HUSTLE10',
      email: 'a@b.com',
      paymentMethod: 'cod',
    });
    expect(rpc).toHaveBeenCalledWith('quote_order', {
      p_items: [{ variant_sku: 'HOOD-M', quantity: 2 }],
      p_coupon_code: 'HUSTLE10',
      p_customer_email: 'a@b.com',
      p_payment_method: 'cod',
    });
  });

  it('P1.4 returns the server payload verbatim — no local recomputation', async () => {
    configured = true;
    // Deliberately arithmetic-inconsistent: total is NOT subtotal - discount +
    // shipping. A client that recomputed would "fix" it; this must not.
    const payload = quote({
      subtotal_cents: 149900,
      discount_cents: 14990,
      shipping_cents: 9900,
      total_cents: 1,
    });
    rpc.mockResolvedValueOnce({ data: payload, error: null });
    const got = await quoteOrder({ items: [{ variant_sku: 'HOOD-M', quantity: 1 }] });
    expect(got.total_cents).toBe(1);
    expect(got.subtotal_cents).toBe(149900);
  });

  it('P1.5 only shows a strike-through when the MRP genuinely exceeds the price', () => {
    expect(lineMrpCents(line({ compare_at_cents: null }))).toBeNull();
    expect(lineMrpCents(line({ compare_at_cents: 149900 }))).toBeNull(); // equal — not a discount
    expect(lineMrpCents(line({ compare_at_cents: 100000 }))).toBeNull(); // below — nonsense
    expect(lineMrpCents(line({ compare_at_cents: 199900 }))).toBe(199900);
  });

  it('P1.6 floors the discount percentage so it can never overstate', () => {
    // 149900 -> 119900 is 20.01% off; showing 21% would be a lie.
    expect(lineDiscountPercent(line({ unit_price_cents: 119900, compare_at_cents: 149900 }))).toBe(20);
    expect(lineDiscountPercent(line({ compare_at_cents: null }))).toBeNull();
  });

  it('P1.7 measures free-delivery progress on the pre-discount subtotal', () => {
    // A coupon must not strip free delivery from a cart that qualified before it.
    const q = quote({
      subtotal_cents: 140000,
      discount_cents: 20000,
      free_shipping_threshold_cents: 149900,
    });
    expect(remainingForFreeShipping(q)).toBe(9900);
    expect(freeShippingProgress(q)).toBe(93);
  });

  it('P1.8 reports zero remaining once the threshold is met', () => {
    const q = quote({ subtotal_cents: 200000, free_shipping_threshold_cents: 149900 });
    expect(remainingForFreeShipping(q)).toBe(0);
    expect(freeShippingProgress(q)).toBe(100);
  });

  // Storefront cards have no quote line, so they read the catalog's MRP
  // directly. That path has no server to enforce the expiry for it, which is
  // exactly how an ended sale keeps advertising itself.
  describe('catalogMrp — a strike-through is a claim about a live sale', () => {
    const NOW = new Date('2026-10-31T00:00:00Z');
    const base = { priceCents: 119900, compareAtPriceCents: 149900 };

    it('P1.9 shows a live markdown with a floored percentage', () => {
      // 149900 -> 119900 is 20.01% off; the badge must not claim 21%.
      expect(catalogMrp({ ...base, compareAtEndsAt: null }, NOW)).toEqual({
        mrpCents: 149900,
        offPercent: 20,
      });
      // Open-ended: absent and null both mean "no expiry".
      expect(catalogMrp(base, NOW)?.offPercent).toBe(20);
      expect(catalogMrp({ ...base, compareAtEndsAt: '2026-12-01T00:00:00Z' }, NOW)?.offPercent).toBe(20);
    });

    it('P1.10 refuses an expired markdown', () => {
      expect(catalogMrp({ ...base, compareAtEndsAt: '2026-10-30T23:59:59Z' }, NOW)).toBeNull();
      // Exactly on the boundary the sale is over, matching price_cart's
      // `compare_at_ends_at > now()` test.
      expect(catalogMrp({ ...base, compareAtEndsAt: '2026-10-31T00:00:00Z' }, NOW)).toBeNull();
    });

    it('P1.11 refuses a markdown that is not a markdown', () => {
      expect(catalogMrp({ priceCents: 119900 }, NOW)).toBeNull();
      expect(catalogMrp({ priceCents: 149900, compareAtPriceCents: 149900 }, NOW)).toBeNull();
      expect(catalogMrp({ priceCents: 149900, compareAtPriceCents: 100000 }, NOW)).toBeNull();
      // A percentage that floors to zero is not worth a badge.
      expect(catalogMrp({ priceCents: 149899, compareAtPriceCents: 149900 }, NOW)).toBeNull();
    });

    it('P1.12 treats an unparseable expiry as no sale, not as forever', () => {
      expect(catalogMrp({ ...base, compareAtEndsAt: 'not-a-date' }, NOW)).toBeNull();
    });
  });
});
