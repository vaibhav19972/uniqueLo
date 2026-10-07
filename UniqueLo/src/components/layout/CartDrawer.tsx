import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { getCartLine, formatPrice, type CartLine } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { CartLineItem } from './CartLineItem';
import { Button } from '../ui/Button';

interface CartUpsellItem {
  sku: string;
  name: string;
  priceCents: number;
  image: string;
  description: string;
}

const UPSELL_ITEMS: CartUpsellItem[] = [
  {
    sku: 'acc-care-kit',
    name: 'Mulberry Silk Thread Conditioner & Wax',
    priceCents: 2800,
    image: '/images/products/embroidered-silk-scarf-2.jpg',
    description: 'Natural beeswax formula to protect thread luster.',
  },
  {
    sku: 'acc-hanger-bag',
    name: 'Cedar Garment Hanger & Linen Bag',
    priceCents: 4500,
    image: '/images/products/needlework-canvas-tote-2.jpg',
    description: 'Archival breathable linen preservation bag.',
  },
];

export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const showToast = useToastStore((state) => state.showToast);

  const { data: products } = useProducts();

  // Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountCents?: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Gift Note State
  const [hasGiftNote, setHasGiftNote] = useState(false);
  const [giftNoteText, setGiftNoteText] = useState('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const cartLines = useMemo(() => {
    return items
      .map((item) => getCartLine(item, products ?? []))
      .filter((line): line is CartLine => line !== null);
  }, [items, products]);

  const rawSubtotalCents = useMemo(() => {
    return cartLines.reduce((acc, line) => acc + line.lineTotalCents, 0);
  }, [cartLines]);

  // Discount calculation
  const discountCents = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return Math.round((rawSubtotalCents * appliedCoupon.discountPercent) / 100);
    }
    if (appliedCoupon.discountCents) {
      return Math.min(rawSubtotalCents, appliedCoupon.discountCents);
    }
    return 0;
  }, [rawSubtotalCents, appliedCoupon]);

  const subtotalCents = Math.max(0, rawSubtotalCents - discountCents);

  // Free shipping ($350) and Gift Tier ($600)
  const freeShippingThresholdCents = 35000;
  const giftTierThresholdCents = 60000;

  const freeShippingQualified = subtotalCents >= freeShippingThresholdCents || appliedCoupon?.code === 'FREESHIP';
  const giftTierQualified = subtotalCents >= giftTierThresholdCents;

  const remainingForFreeShipping = Math.max(0, freeShippingThresholdCents - subtotalCents);
  const remainingForGiftTier = Math.max(0, giftTierThresholdCents - subtotalCents);

  const shippingCostCents = freeShippingQualified ? 0 : 2500;
  const finalTotalCents = subtotalCents + shippingCostCents;

  // Progress meters
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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'ATELIER10') {
      setAppliedCoupon({ code, discountPercent: 10 });
      showToast({ title: 'Coupon Applied', description: '10% privilege savings deducted.', type: 'success' });
    } else if (code === 'NEEDLECRAFT') {
      setAppliedCoupon({ code, discountCents: 4000 });
      showToast({ title: 'Coupon Applied', description: '$40.00 needlecraft gift applied.', type: 'success' });
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code });
      showToast({ title: 'Coupon Applied', description: 'Complimentary shipping unlocked.', type: 'success' });
    } else {
      setCouponError('Invalid atelier privilege code.');
    }
    setCouponCode('');
  };

  const handleAddUpsell = (upsell: CartUpsellItem) => {
    // If an accessories product exists, attach or add as line
    const accProduct = products?.find((p) => p.categorySlug === 'accessories') || products?.[0];
    if (accProduct) {
      addItem(accProduct.slug, accProduct.variants[0].sku, 1);
      showToast({
        title: 'Archival Care Added',
        description: upsell.name,
        type: 'accent',
      });
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) return;
    setCheckoutStep('success');
    clearCart();
    showToast({
      title: 'Order Confirmed',
      description: 'Your bespoke commission has been queued with the master needleworker.',
      type: 'success',
    });
  };

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
        <div className="p-5 sm:p-6 border-b border-stone/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-serif text-xl sm:text-2xl text-ink tracking-wide">Atelier Bag</h3>
            <span className="text-xs font-sans text-ink-muted">
              ({cartLines.reduce((acc, line) => acc + line.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 text-ink-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tiered Shipping & Monogram Meter */}
        <div className="bg-cream px-6 py-3.5 border-b border-stone/60 text-xs text-ink">
          {giftTierQualified ? (
            <p className="text-accent font-medium tracking-wide flex items-center gap-1.5">
              <span>✦</span> Complimentary Monogramming & Worldwide Shipping Unlocked!
            </p>
          ) : freeShippingQualified ? (
            <div>
              <p className="text-accent font-medium tracking-wide flex items-center gap-1.5">
                <span>✦</span> Complimentary white-glove shipping unlocked
              </p>
              <p className="text-[11px] text-ink-muted mt-1 font-light">
                Add <span className="font-medium text-ink">{formatPrice(remainingForGiftTier)}</span> more to unlock complimentary bespoke monogramming & archival cedar dustbag.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-light text-ink-muted">
                Add <span className="font-medium text-ink">{formatPrice(remainingForFreeShipping)}</span> more for complimentary atelier delivery
              </p>
              <div className="w-full bg-stone h-1.5 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-500"
                  style={{ width: `${shippingProgressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Middle: Line Items + Upsell Carousel + Notes */}
        <div className="flex-1 overflow-y-auto px-6 divide-y divide-stone/40">
          {cartLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full border border-stone/80 flex items-center justify-center text-stone text-lg">
                ✦
              </div>
              <div>
                <p className="font-serif text-xl text-ink">Your bag is currently empty</p>
                <p className="text-xs text-ink-muted mt-1 max-w-xs font-light leading-relaxed">
                  Explore our limited needlework coats, cashmere knitwear, and bespoke shirts.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={closeCart}
                className="mt-2"
              >
                <Link to="/shop">Discover Collections</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Product Lines */}
              <div className="py-2 divide-y divide-stone/40">
                {cartLines.map((line) => (
                  <CartLineItem
                    key={line.id}
                    line={line}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* In-Drawer Upsells: Frequently Stitched Together */}
              <div className="py-5">
                <span className="text-[10px] uppercase tracking-widest text-accent font-medium block mb-2.5">
                  ✦ Frequently Stitched Together
                </span>
                <div className="space-y-3">
                  {UPSELL_ITEMS.map((up) => (
                    <div key={up.sku} className="flex items-center gap-3 p-2.5 bg-cream/70 border border-stone/70 rounded-sm">
                      <img src={up.image} alt={up.name} className="w-12 h-12 object-cover border border-stone/60" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif text-xs text-ink truncate">{up.name}</h5>
                        <span className="text-[11px] font-sans text-ink-muted font-medium">{formatPrice(up.priceCents)}</span>
                      </div>
                      <button
                        onClick={() => handleAddUpsell(up)}
                        className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-ink text-cream hover:bg-accent transition-colors font-medium whitespace-nowrap"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Note Section */}
              <div className="py-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink font-medium">
                  <input
                    type="checkbox"
                    checked={hasGiftNote}
                    onChange={(e) => setHasGiftNote(e.target.checked)}
                    className="accent-accent"
                  />
                  <span>Add handwritten atelier gift message</span>
                </label>
                {hasGiftNote && (
                  <textarea
                    rows={2}
                    value={giftNoteText}
                    onChange={(e) => setGiftNoteText(e.target.value)}
                    placeholder="Enter your message for the hand-stamped parchment card..."
                    className="w-full mt-2 p-2.5 bg-cream border border-stone text-xs text-ink focus:outline-accent"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer & Checkout Trigger */}
        {cartLines.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-stone/60 bg-paper space-y-3.5">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex justify-between items-center text-xs p-2 bg-cream border border-stone/60">
                  <span className="text-accent font-medium tracking-wide">
                    ✦ Code {appliedCoupon.code} Applied
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] uppercase text-ink-muted hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Privilege Code (try ATELIER10)"
                    className="flex-1 bg-cream border border-stone px-3 py-1.5 text-xs text-ink uppercase tracking-wider placeholder:text-warm-gray focus:outline-accent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone/70 hover:bg-ink hover:text-cream text-xs text-ink uppercase tracking-wider transition-colors font-medium"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-error mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="text-ink font-medium">{formatPrice(rawSubtotalCents)}</span>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between text-accent font-medium">
                  <span>Privilege Savings</span>
                  <span>–{formatPrice(discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span>{freeShippingQualified ? 'Complimentary' : '$25.00'}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-ink pt-2 border-t border-stone/40">
                <span>Total</span>
                <span>{formatPrice(finalTotalCents)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full tracking-widest text-xs uppercase h-11"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Proceed to Atelier Checkout
            </Button>

            <p className="text-[10px] text-center text-ink-muted tracking-wide font-light">
              ✦ White-glove archival boxing & 30-day atelier exchange guarantee
            </p>
          </div>
        )}
      </div>

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[490] flex items-center justify-center p-4">
          <div
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-ink/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-paper border border-stone shadow-2xl rounded-sm p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
            {checkoutStep === 'details' ? (
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-stone/60">
                  <h3 className="font-serif text-2xl text-ink">Atelier Order Checkout</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-xs text-ink-muted">✕</button>
                </div>

                <div className="my-4 p-3 bg-cream border border-stone/60 text-xs">
                  <div className="flex justify-between font-medium text-ink">
                    <span>Order Total ({cartLines.length} items):</span>
                    <span>{formatPrice(finalTotalCents)}</span>
                  </div>
                  {appliedCoupon && (
                    <span className="text-[11px] text-accent block mt-1">✦ Code {appliedCoupon.code} applied</span>
                  )}
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Lady Vivienne Montgomery"
                      className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. vivienne@atelier.com"
                      className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Street, City, State/Province, Postal Code, Country"
                      className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  <div className="p-3 bg-paper border border-stone/70 text-[11px] text-ink-muted">
                    <span className="text-ink font-medium block">✦ White-Glove Courier Service</span>
                    Estimated dispatch in 2 business days. Hand-packaged in archival Japanese mulberry boxes.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                      Back to Bag
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Complete Order ({formatPrice(finalTotalCents)})
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-success/10 text-success text-2xl flex items-center justify-center mx-auto mb-4">
                  ✓
                </div>
                <h3 className="font-serif text-3xl text-ink">Commission Confirmed</h3>
                <p className="text-xs text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-ink font-medium">{customerName}</span>. Your bespoke order has been assigned to our master embroidery workshop. An archival invoice has been transmitted to <span className="text-ink font-medium">{customerEmail}</span>.
                </p>
                <div className="mt-6">
                  <Button variant="primary" size="sm" onClick={() => { setIsCheckoutOpen(false); closeCart(); }}>
                    Return to Atelier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
