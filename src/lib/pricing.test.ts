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
  lineMrpCents,
  lineDiscountPercent,
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
});
