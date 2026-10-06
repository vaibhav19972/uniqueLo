import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { getProducts, getCartLine, formatPrice, type CartLine } from '../../lib/data';
import { CartLineItem } from './CartLineItem';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const products = useMemo(() => getProducts(), []);

  const cartLines = useMemo(() => {
    return items
      .map((item) => getCartLine(item, products))
      .filter((line): line is CartLine => line !== null);
  }, [items, products]);

  const subtotalCents = useMemo(() => {
    return cartLines.reduce((acc, line) => acc + line.lineTotalCents, 0);
  }, [cartLines]);

  // Shipping threshold: $350 (35000 cents)
  const freeShippingThresholdCents = 35000;
  const freeShippingQualified = subtotalCents >= freeShippingThresholdCents;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdCents - subtotalCents);
  const shippingProgressPercent = Math.min(
    100,
    Math.round((subtotalCents / freeShippingThresholdCents) * 100)
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-end">
      {/* Frosted Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-md bg-paper h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-stone/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-serif text-xl text-ink tracking-wide">Atelier Bag</h3>
            <span className="text-xs font-sans text-ink-muted">
              ({cartLines.reduce((acc, line) => acc + line.quantity, 0)})
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1 text-ink-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-cream px-6 py-3 border-b border-stone/60 text-xs text-ink">
          {freeShippingQualified ? (
            <p className="text-accent font-medium tracking-wide flex items-center gap-1.5">
              <span>✦</span> Complimentary worldwide white-glove shipping unlocked
            </p>
          ) : (
            <div>
              <p className="font-light text-ink-muted">
                Add <span className="font-medium text-ink">{formatPrice(remainingForFreeShipping)}</span> more for complimentary atelier delivery
              </p>
              <div className="w-full bg-stone h-1 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-500"
                  style={{ width: `${shippingProgressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Line Items List */}
        <div className="flex-1 overflow-y-auto px-6 divide-y divide-stone/40">
          {cartLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full border border-stone/80 flex items-center justify-center text-stone text-lg">
                ✦
              </div>
              <div>
                <p className="font-serif text-lg text-ink">Your bag is currently empty</p>
                <p className="text-xs text-ink-muted mt-1 max-w-xs font-light">
                  Explore our limited needlework coats, cashmere knitwear, and bespoke shirts.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={closeCart}
                className="mt-2"
              >
                <Link to="/shop">Discover Collection</Link>
              </Button>
            </div>
          ) : (
            cartLines.map((line) => (
              <CartLineItem
                key={line.id}
                line={line}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cartLines.length > 0 && (
          <div className="p-6 border-t border-stone/60 bg-paper space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="text-ink font-medium">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span>{freeShippingQualified ? 'Complimentary' : '$25.00'}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-ink pt-2 border-t border-stone/40">
                <span>Total</span>
                <span>{formatPrice(subtotalCents + (freeShippingQualified ? 0 : 2500))}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full tracking-widest text-xs"
              onClick={() => {
                alert('Atelier Checkout initialized. Secure payment processing is configured.');
              }}
            >
              Proceed to Atelier Checkout
            </Button>

            <p className="text-[10px] text-center text-ink-muted tracking-wide">
              Complimentary carbon-neutral shipping & 30-day atelier exchanges
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
