import React from 'react';
import { Link } from 'react-router';
import { useWishlistStore } from '../../stores/wishlist';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { useToastStore } from '../../stores/toast';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * SAVED PIECES (WISHLIST) — Modern Streetwear D2C Revamp
 *
 * Clean white ground, bold display typography, 3:4 image cards,
 * crimson pricing, instant "Move to Bag", and quick clear.
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

  const handleAddAllToBag = () => {
    let addedCount = 0;
    savedProducts.forEach((product) => {
      const variant = getDefaultVariant(product);
      if (variant && variant.status !== 'out-of-stock') {
        addItem(product.slug, variant.sku, 1);
        toggleWishlist(product.slug);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      closeWishlist();
      openCart();
      showToast({
        title: 'Items moved to bag',
        description: `Added ${addedCount} saved pieces to your bag.`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'No available items',
        description: 'None of the saved pieces are currently in stock.',
        type: 'info',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[310] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-[28rem] flex-col bg-white text-neutral-900 shadow-2xl"
      >
        {/* Head */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <div className="flex items-center gap-2.5">
            <h2 id="wishlist-title" className="font-display text-lg font-black uppercase tracking-tight text-neutral-900">
              Saved Pieces
            </h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-700">
              {savedSlugs.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {savedSlugs.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs font-bold text-neutral-400 hover:text-red-600 px-2 py-1 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={closeWishlist}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              aria-label="Close saved pieces"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-neutral-100 no-scrollbar">
          {savedProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900">
                No Saved Pieces Yet
              </h3>
              <p className="mt-1.5 max-w-[28ch] text-xs text-neutral-500 leading-relaxed">
                Tap the heart on any drop to curate your personal wishlist on this device.
              </p>
              <Link
                to="/shop"
                onClick={closeWishlist}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-lg bg-black px-6 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
              >
                Explore Collection →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {savedProducts.map((product) => {
                const defaultVariant = getDefaultVariant(product);
                const isSoldOut = !defaultVariant || defaultVariant.status === 'out-of-stock';
                const mrp = defaultVariant ? catalogMrp(defaultVariant) : null;

                return (
                  <div
                    key={product.slug}
                    className="flex gap-3.5 py-4.5 first:pt-4"
                  >
                    {/* 3:4 Image */}
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeWishlist}
                      className="group relative h-24 w-18 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                    >
                      <img
                        src={product.images?.[0]?.src || '/images/placeholders/hero.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            onClick={closeWishlist}
                            className="line-clamp-2 text-xs font-black uppercase tracking-tight text-neutral-900 transition-colors hover:text-red-600"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.slug)}
                            className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove from saved"
                            aria-label={`Remove ${product.name} from saved`}
                          >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Price and size */}
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-mono text-xs font-black text-[#D32F2F]">
                            {defaultVariant ? formatPrice(defaultVariant.priceCents) : '—'}
                          </span>
                          {mrp?.mrpCents && mrp.mrpCents > (defaultVariant?.priceCents ?? 0) && (
                            <span className="font-mono text-[11px] text-neutral-400 line-through">
                              {formatPrice(mrp.mrpCents)}
                            </span>
                          )}
                          {defaultVariant?.size && (
                            <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[10px] font-bold text-neutral-700">
                              Size {defaultVariant.size}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Move to Bag Action */}
                      <div className="mt-3 pt-1">
                        <button
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => handleMoveToBag(product.slug)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-black px-4 text-xs font-black uppercase tracking-wider text-white shadow-2xs transition hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                        >
                          <span>{isSoldOut ? 'Sold Out' : 'Move to Bag'}</span>
                          {!isSoldOut && <span aria-hidden="true">→</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {savedProducts.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4 space-y-2">
            <button
              type="button"
              onClick={handleAddAllToBag}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-xs transition hover:bg-neutral-800 active:scale-[0.99]"
            >
              <span>Move All In-Stock to Bag</span>
              <span>→</span>
            </button>
            <Link
              to="/shop"
              onClick={closeWishlist}
              className="flex min-h-[42px] w-full items-center justify-center rounded-lg border border-neutral-300 bg-white text-xs font-bold uppercase tracking-wider text-neutral-700 hover:border-black hover:text-black transition-colors"
            >
              Continue Browsing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
