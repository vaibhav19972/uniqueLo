import { supabase, isSupabaseConfigured } from './supabase';
import type { PaymentMethod } from './data';

// ─────────────────────────────────────────────────────────────────────
// Server-side pricing contract
// ─────────────────────────────────────────────────────────────────────
// Everything in this file mirrors what public.price_cart() returns. The client
// renders these numbers; it never recomputes them. That is the whole point:
// the bag used to invent `subtotal * 1.266`, a hardcoded Rs 400 "savings" floor
// and a 21% badge that no table backed. Any arithmetic here is a bug.

/** One priced line, exactly as public.price_cart() returns it.
 *  Deliberately no `name`: the RPC does not return one. Display names come from
 *  the local catalog keyed by product_slug. Do not add a field here that the
 *  server does not send — that is how the bag ended up inventing numbers. */
export interface PricedLine {
  sku: string;
  product_slug: string;
  color: string;
  size: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  /** Genuine MRP (strike-through). null = never on sale, show no badge. */
  compare_at_cents: number | null;
  stock_available: number;
}

/** A coupon the customer applied, or the reason it was refused. */
export interface AppliedCoupon {
  code: string;
  discount_type?: 'percent' | 'fixed' | 'free_shipping';
  discount_cents?: number;
  free_shipping?: boolean;
  /** Present only when the code was rejected. */
  error?: string;
}

/** A coupon worth prompting for. Never auto-applied. */
export interface BestCoupon {
  code: string;
  description?: string;
  discount_type: 'percent' | 'fixed' | 'free_shipping';
  discount_value: number;
  value_cents: number;
  min_subtotal_cents: number;
}

export interface Quote {
  lines: PricedLine[];
  units: number;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  cod_fee_cents: number;
  total_cents: number;
  free_shipping_threshold_cents: number;
  flat_rate_cents: number;
  cod_max_units: number;
  payment_method: 'cod' | 'prepaid';
  coupon: AppliedCoupon | null;
  best_coupon: BestCoupon | null;
  available_offers?: BestCoupon[];
  /** Real, verifiable saving: MRP delta + discount + waived carriage. */
  savings_cents: number;
  quoted_at?: string;
  /** false for anonymous callers — see migration 20261101 section 7. */
  identity_checked?: boolean;
}

export interface QuoteItem {
  variant_sku: string;
  quantity: number;
}

export class QuoteError extends Error {
  constructor(
    message: string,
    readonly code?: string
  ) {
    super(message);
    this.name = 'QuoteError';
  }
}

/**
 * The server refused a specific variant rather than the request as a whole.
 *
 * `quote_order` raises `P0002 Unknown or uncatalogued variant SKU: <sku>` and
 * names the offender in the message. That is the one quote failure a customer
 * can act on: the SKU is unpurchasable, so the line must go rather than the
 * whole checkout be blacklisted. Kept as its own class so the UI can prune and
 * retry instead of printing a Postgres exception at a shopper.
 */
export class UnknownVariantError extends QuoteError {
  constructor(
    message: string,
    readonly sku: string
  ) {
    super(message, 'UNKNOWN_VARIANT');
    this.name = 'UnknownVariantError';
  }
}

/** Extracts the SKU from `Unknown or uncatalogued variant SKU: <sku>`. */
const UNKNOWN_SKU_RE = /variant sku:\s*(\S+)/i;

export function parseUnknownVariant(message: string | undefined): string | null {
  if (!message) return null;
  const m = UNKNOWN_SKU_RE.exec(message);
  return m ? m[1].trim() : null;
}

/**
 * Ask the server what this bag costs.
 *
 * This is the only source of money in the app. It is called on every bag
 * mutation and again on the checkout page, so the customer sees a priced bag
 * that the server will actually honour.
 */
export async function quoteOrder(input: {
  items: QuoteItem[];
  couponCode?: string | null;
  email?: string | null;
  paymentMethod?: PaymentMethod;
}): Promise<Quote> {
  const payload = input.items.map((i) => ({
    variant_sku: i.variant_sku,
    quantity: i.quantity,
  }));

  if (!isSupabaseConfigured() || !supabase) {
    // Local mode has no pricing authority. Rather than fabricate a number that
    // looks authoritative, say so — the caller renders a "pricing unavailable"
    // state instead of a total the server would never honour.
    throw new QuoteError(
      'Pricing is unavailable: Supabase is not configured for this build.',
      'NO_BACKEND'
    );
  }

  const { data, error } = await supabase.rpc('quote_order', {
    p_items: payload,
    p_coupon_code: input.couponCode ?? null,
    p_customer_email: input.email ?? null,
    p_payment_method: input.paymentMethod === 'cod' ? 'cod' : 'prepaid',
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    const missing =
      error.code === 'PGRST202' ||
      error.code === '42883' ||
      (msg.includes('function') && msg.includes('not found'));
    if (missing) {
      throw new QuoteError(
        'Server pricing is not deployed yet. Run migration 20261101_checkout_pricing.sql.',
        'NOT_DEPLOYED'
      );
    }
    // P0002 names the SKU it refused. Surface it as a typed error so the caller
    // can drop that line and re-quote instead of showing a raw database message.
    if (error.code === 'P0002') {
      const sku = parseUnknownVariant(error.message);
      if (sku) throw new UnknownVariantError(error.message, sku);
    }
    throw new QuoteError(error.message || 'Could not price your bag.', error.code);
  }

  if (!data) {
    throw new QuoteError('Server returned an empty quote.', 'EMPTY');
  }

  return data as Quote;
}

/** Convenience: is a genuine strike-through available on this line? */
export function lineMrpCents(line: PricedLine): number | null {
  if (line.compare_at_cents == null) return null;
  // A "MRP" that is not actually higher is not a discount. Show nothing.
  return line.compare_at_cents > line.unit_price_cents ? line.compare_at_cents : null;
}

/** Percent off, rounded DOWN so the badge never overstates the markdown. */
export function lineDiscountPercent(line: PricedLine): number | null {
  const mrp = lineMrpCents(line);
  if (mrp == null || mrp <= 0) return null;
  const pct = Math.floor(((mrp - line.unit_price_cents) / mrp) * 100);
  return pct > 0 ? pct : null;
}

/** MRP triple for a catalog variant: the strike-through price and the honest
 *  percent off, or nulls when there is no live markdown.
 *
 *  The catalog carries the reference price AND its expiry, but only the server
 *  enforces the expiry (price_cart returns compare_at_cents only while
 *  unexpired). Storefront cards have no quote line, so they must apply the same
 *  rule locally — a strike-through is a claim about a sale, and a sale that has
 *  ended cannot keep being advertised.
 *
 *  Returns nothing when the markdown is expired, when there is no reference
 *  price, or when the reference price is not actually higher than the selling
 *  price (the storage-layer check, mirrored so a bad row can never lie in the UI).
 */
export function catalogMrp(
  variant: { priceCents: number; compareAtPriceCents?: number; compareAtEndsAt?: string | null },
  now: Date = new Date()
): { mrpCents: number; offPercent: number } | null {
  const mrp = variant.compareAtPriceCents;
  if (mrp == null || mrp <= variant.priceCents) return null;

  const ends = variant.compareAtEndsAt;
  if (ends != null) {
    const endsAt = new Date(ends);
    // An unparseable date is not a reason to advertise a sale forever.
    if (Number.isNaN(endsAt.getTime()) || endsAt <= now) return null;
  }

  // Rounded DOWN, same as lineDiscountPercent — the badge never overstates.
  const pct = Math.floor(((mrp - variant.priceCents) / mrp) * 100);
  return pct > 0 ? { mrpCents: mrp, offPercent: pct } : null;
}

/** How much more to spend to unlock free delivery. 0 when already there. */
export function remainingForFreeShipping(quote: Quote): number {
  // `subtotal_cents` is the PRE-discount subtotal — the server computes it before
  // applying the coupon and compares the threshold against it directly
  // (migration 20261101, section "shipping"). Adding discount_cents back would
  // double-count and understate how much is left to spend.
  return Math.max(0, quote.free_shipping_threshold_cents - quote.subtotal_cents);
}

/** Free-delivery progress, 0..100, on the same pre-discount basis. */
export function freeShippingProgress(quote: Quote): number {
  const t = quote.free_shipping_threshold_cents;
  if (!t || t <= 0) return 100;
  return Math.min(100, Math.round((quote.subtotal_cents / t) * 100));
}
