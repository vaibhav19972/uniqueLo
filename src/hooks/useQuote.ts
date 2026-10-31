import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { quoteOrder, type Quote, type QuoteError, type QuoteItem } from '../lib/pricing';
import type { PaymentMethod } from '../lib/data';

/**
 * The bag's single source of pricing truth.
 *
 * Every money render in the bag and on /checkout reads from this. Nothing in a
 * component may compute a subtotal, a discount, a shipping charge or a saving:
 * that is exactly how the previous bag ended up showing `subtotal * 1.266`, a
 * hardcoded Rs 400 savings floor and a 21% badge with no table behind it.
 */
export function useQuote(opts?: { couponCode?: string | null; paymentMethod?: PaymentMethod }) {
  const items = useCartStore((s) => s.items);
  const email = useAuthStore((s) => s.user?.email ?? null);

  const cartKey = useMemo(
    () =>
      items
        .map((i) => `${i.variantSku}:${i.quantity}`)
        .sort()
        .join('|'),
    [items]
  );

  const quoteItems: QuoteItem[] = useMemo(
    () => items.map((i) => ({ variant_sku: i.variantSku, quantity: i.quantity })),
    // cartKey is the stable identity of this set; items itself is a new array
    // on every store write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartKey]
  );

  const couponCode = opts?.couponCode ?? null;
  const paymentMethod = opts?.paymentMethod ?? 'upi';

  const query = useQuery<Quote, QuoteError>({
    queryKey: ['quote', cartKey, couponCode, paymentMethod, email],
    queryFn: () =>
      quoteOrder({
        items: quoteItems,
        couponCode,
        email,
        paymentMethod,
      }),
    // A quote is server-side truth about money. Cache briefly so tabbing around
    // does not re-price a static bag, but never treat it as a build constant.
    staleTime: 15_000,
    retry: (count, err) => {
      // Do not retry a structural failure: no backend, or the RPC is not
      // deployed. Retrying just delays an honest error message.
      if (err?.code === 'NO_BACKEND' || err?.code === 'NOT_DEPLOYED') return false;
      // An unknown SKU is deterministic — the same bag will be refused forever.
      // Retrying burns the customer's time before the prune can happen.
      if (err?.code === 'UNKNOWN_VARIANT') return false;
      return count < 2;
    },
    enabled: quoteItems.length > 0,
  });

  return {
    quote: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    isEmpty: quoteItems.length === 0,
    refetch: query.refetch,
  };
}
