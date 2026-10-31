import React from 'react';
import { Link } from 'react-router';
import { useWishlistStore } from '../../stores/wishlist';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';

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

  // Close on Escape
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeWishlist();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeWishlist]);

  if (!isOpen) return null;

  const handleMoveToBag = (slug: string) => {
    const product = savedProducts.find((p) => p.slug === slug);
    if (!product) return;
    const variant = getDefaultVariant(product);
    if (!variant || variant.status === 'out-of-stock') {
      showToast({
        title: 'Sold Out',
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
      title: 'Moved to Bag',
      description: `${product.name} is now in your Atelier Bag.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Saved Pieces">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-panel-raised/40 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md bg-cream text-ink h-full shadow-2xl flex flex-col justify-between border-l border-stone animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl tracking-wide">Saved Pieces</h2>
            <span className="text-xs uppercase tracking-widest text-ink/50 bg-panel-raised/5 px-2 py-0.5 rounded-full font-mono">
              {savedSlugs.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {savedSlugs.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs text-ink/40 hover:text-rust transition-colors uppercase tracking-wider"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeWishlist}
              className="p-2 text-ink/60 hover:text-ink transition-colors"
              aria-label="Close wishlist drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-panel-raised/5 flex items-center justify-center text-ink/40">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className="font-serif text-lg text-ink">Your Saved Pieces is Empty</p>
              <p className="text-sm text-ink/60 max-w-xs">
                Save garments you love by tapping the heart icon on any piece while exploring.
              </p>
              <Link
                to="/shop"
                onClick={closeWishlist}
                className="mt-4 px-6 py-2.5 bg-panel-raised text-white hover:bg-gold hover:text-ink transition-colors text-xs font-mono tracking-widest uppercase rounded-sm"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            savedProducts.map((product) => {
              const defaultVariant = getDefaultVariant(product);
              const isSoldOut = !defaultVariant || defaultVariant.status === 'out-of-stock';
              const primaryImg = product.images?.[0]?.src || '/images/placeholders/hoodie.jpg';

              return (
                <div
                  key={product.slug}
                  className="flex gap-4 p-3 bg-panel border border-stone rounded-sm hover:border-stone-strong transition-colors"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={closeWishlist}
                    className="w-20 h-24 bg-panel-raised/5 shrink-0 overflow-hidden rounded-xs"
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={closeWishlist}
                          className="font-serif text-sm font-medium leading-snug hover:text-gold transition-colors truncate block"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.slug)}
                          className="text-ink/40 hover:text-rust p-1 shrink-0"
                          title="Remove from saved"
                          aria-label={`Remove ${product.name} from saved`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-ink/50 truncate mt-0.5">{product.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5 font-mono text-xs">
                        <span className="font-medium">{formatPrice(defaultVariant?.priceCents || 0)}</span>
                        {product.codAvailable && (
                          <span className="text-xs uppercase tracking-wider text-olive bg-olive/10 px-1.5 py-0.5 rounded-xs">
                            COD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isSoldOut}
                        onClick={() => handleMoveToBag(product.slug)}
                        className="w-full text-xs py-1.5"
                      >
                        {isSoldOut ? 'Sold Out' : 'Move to Bag'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-6 border-t border-stone bg-panel">
            <Link
              to="/shop"
              onClick={closeWishlist}
              className="block w-full py-2.5 text-center border border-ink/20 text-ink hover:bg-panel-raised hover:text-white transition-colors text-xs font-mono tracking-widest uppercase rounded-sm"
            >
              Continue Exploring
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
