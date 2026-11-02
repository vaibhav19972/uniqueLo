import React from 'react';
import { Link } from 'react-router';
import { useWishlistStore } from '../../stores/wishlist';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * SAVED PIECES
 *
 * A drawer, so it keeps the bag's shape — but nothing else from the old
 * version: a serif heading in a rounded count pill, a blurred backdrop, a
 * circular icon badge in the empty state, rounded item cards with `bg-paper/70`
 * and accent text, and an olive "COD" pill. All of it was a different system's
 * vocabulary bolted onto this one.
 *
 * Now: the same ruled drawer grammar as the bag — display heading with the
 * count in mono, hairline rules, square item plates on paper, price in mono,
 * one ink action per item. Empty state is a sentence, not an illustration.
 */
export const WishlistDrawer: React.FC = () => {
  const isOpen = useWishlistStore((state) => state.isOpen);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const savedSlugs = useWishlistStore((state) => state.savedSlugs);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const showToast = useToastStore((state) => state.showToast);

  const { data: allProducts } = useProducts();
  const savedProducts = React.useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p) => savedSlugs.includes(p.slug));
  }, [allProducts, savedSlugs]);

  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, closeWishlist);

  if (!isOpen) return null;

  const handleMoveToBag = (slug: string) => {
    const product = savedProducts.find((p) => p.slug === slug);
    if (!product) return;
    const variant = getDefaultVariant(product);
    if (!variant || variant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out',
        description: 'This piece is currently unavailable.',
        type: 'info',
      });
      return;
    }
    addItem(product.slug, variant.sku, 1);
    toggleWishlist(slug);
    closeWishlist();
    openCart();
    showToast({
      title: 'Moved to bag',
      description: `${product.name} is now in your bag.`,
      type: 'success',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[310] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Saved pieces"
    >
      <div
        className="fixed inset-0 bg-ink/40"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-stone bg-paper text-ink"
        style={{ borderRadius: '14px 0 0 14px' }}
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-stone px-5 py-5">
          <h2 className="loom-display text-[1.375rem] text-ink">
            Saved{' '}
            <span className="loom-price align-baseline text-[13px] text-ink-muted">
              {savedSlugs.length}
            </span>
          </h2>
          <div className="flex items-center gap-4">
            {savedSlugs.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="min-h-[44px] font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:text-ink"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={closeWishlist}
              className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-accent"
              aria-label="Close saved pieces"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {savedProducts.length === 0 ? (
            <div className="flex h-full flex-col justify-center py-16">
              <p className="font-sans text-[15px] leading-relaxed text-ink">
                Nothing saved yet.
              </p>
              <p className="mt-1.5 max-w-[34ch] font-sans text-[13px] leading-relaxed text-ink-muted">
                The heart on any piece keeps it here, on this device.
              </p>
              <Link
                to="/shop"
                onClick={closeWishlist}
                className="mt-6 inline-flex min-h-[48px] w-fit items-center gap-2 bg-ink px-5 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
              >
                Browse the collection
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <ul>
              {savedProducts.map((product) => {
                const defaultVariant = getDefaultVariant(product);
                const isSoldOut = !defaultVariant || defaultVariant.status === 'out-of-stock';

                return (
                  <li
                    key={product.slug}
                    className="flex gap-3.5 border-b border-stone py-4 last:border-b-0"
                  >
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeWishlist}
                      className="block w-[66px] shrink-0 bg-cream"
                    >
                      <img
                        src={product.images?.[0]?.src || '/images/placeholders/hero.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                        className="block h-[88px] w-[66px] object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/product/${product.slug}`}
                            onClick={closeWishlist}
                            className="block font-sans text-[14px] leading-snug text-ink transition-colors hover:text-accent"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.slug)}
                            className="shrink-0 p-1 text-ink-muted transition-colors hover:text-accent"
                            title="Remove from saved"
                            aria-label={`Remove ${product.name} from saved`}
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="loom-price mt-1 text-[13px] text-ink">
                          {defaultVariant ? formatPrice(defaultVariant.priceCents) : '—'}
                        </p>
                        {defaultVariant?.size && (
                          <p className="loom-label mt-1 text-ink-muted">
                            size {defaultVariant.size}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => handleMoveToBag(product.slug)}
                        className="mt-2.5 min-h-[44px] w-fit border border-stone-strong px-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:border-stone disabled:text-ink-muted"
                      >
                        {isSoldOut ? 'Sold out' : 'Move to bag'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {savedProducts.length > 0 && (
          <div className="border-t border-stone px-5 py-4">
            <Link
              to="/shop"
              onClick={closeWishlist}
              className="flex min-h-[48px] w-full items-center justify-center border border-stone-strong font-sans text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
            >
              Continue browsing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
