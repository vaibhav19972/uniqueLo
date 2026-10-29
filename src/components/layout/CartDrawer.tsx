import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { getCartLine, formatPrice, createOrder, getDefaultVariant, type CartLine, type PaymentMethod } from '../../lib/data';
import { useToastStore } from '../../stores/toast';
import { useAuthStore } from '../../stores/auth';
import { CartLineItem } from './CartLineItem';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useIsThemeV2 } from '../../config/theme';

const STANDARD_SHIPPING_CENTS = 199900;

export const CartDrawer: React.FC = () => {
  const isV2 = useIsThemeV2();
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
  const [isCouponInputOpen, setIsCouponInputOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  // Gift Note State
  const [hasGiftNote, setHasGiftNote] = useState(false);
  const [giftNoteText, setGiftNoteText] = useState('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Saved addresses (signed-in customers only). Selecting one fills the form;
  // it does not lock the fields, so a one-off delivery address still works.
  const authUser = useAuthStore((s) => s.user);
  const savedAddresses = useAuthStore((s) => s.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Prefill identity from the account on first open, so a signed-in customer
  // never retypes their own email.
  React.useEffect(() => {
    if (!isCheckoutOpen || !authUser) return;
    setCustomerEmail((prev) => prev || authUser.email || '');
    const name = (authUser.user_metadata?.full_name as string | undefined)?.trim();
    if (name) setCustomerName((prev) => prev || name);
    const def = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];
    if (def && !selectedAddressId) applyAddress(def.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, authUser, savedAddresses.length]);

  const applyAddress = (id: string) => {
    const a = savedAddresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddressId(id);
    setCustomerName(a.recipient_name);
    setCustomerPhone(a.phone.replace(/\D/g, '').slice(-10));
    setCustomerPincode(a.pincode);
    setShippingAddress([a.address_line, a.landmark, a.city, a.state].filter(Boolean).join(', '));
  };

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

  // Free shipping (₹29,050) and Gift Tier (₹49,800) — India-first thresholds
  const freeShippingThresholdCents = 2905000;
  const giftTierThresholdCents = 4980000;

  const freeShippingQualified = subtotalCents >= freeShippingThresholdCents || appliedCoupon?.code === 'FREESHIP';
  const giftTierQualified = subtotalCents >= giftTierThresholdCents;

  const remainingForFreeShipping = Math.max(0, freeShippingThresholdCents - subtotalCents);
  const remainingForGiftTier = Math.max(0, giftTierThresholdCents - subtotalCents);

  const shippingCostCents = freeShippingQualified ? 0 : STANDARD_SHIPPING_CENTS;
  const finalTotalCents = subtotalCents + shippingCostCents;

  // Progress meters
  const shippingProgressPercent = Math.min(
    100,
    Math.round((subtotalCents / freeShippingThresholdCents) * 100)
  );

  // v2 Milestone Thresholds: ₹500 (10%), ₹5,999 (15%), ₹9,999 (20%)
  const milestone1Cents = 50000;
  const milestone2Cents = 599900;
  const milestone3Cents = 999900;

  // v2 Calculated Savings
  const simulatedOriginalTotalCents = Math.round(rawSubtotalCents * 1.266);
  const totalSavingsCents = Math.max(40000, (simulatedOriginalTotalCents - rawSubtotalCents) + discountCents);

  const v2ProgressPercent = useMemo(() => {
    if (rawSubtotalCents <= 0) return 0;
    if (rawSubtotalCents < milestone1Cents) {
      return (rawSubtotalCents / milestone1Cents) * 20;
    }
    if (rawSubtotalCents < milestone2Cents) {
      return 20 + ((rawSubtotalCents - milestone1Cents) / (milestone2Cents - milestone1Cents)) * 40;
    }
    if (rawSubtotalCents < milestone3Cents) {
      return 60 + ((rawSubtotalCents - milestone2Cents) / (milestone3Cents - milestone2Cents)) * 40;
    }
    return 100;
  }, [rawSubtotalCents, milestone1Cents, milestone2Cents, milestone3Cents]);

  const v2MilestonePrompt = useMemo(() => {
    if (rawSubtotalCents < milestone1Cents) {
      const rem = milestone1Cents - rawSubtotalCents;
      return `Add items worth ${formatPrice(rem)} more to unlock 10% off with code HUSTLE10`;
    }
    if (rawSubtotalCents < milestone2Cents) {
      const rem = milestone2Cents - rawSubtotalCents;
      return `Add items worth ${formatPrice(rem)} more to unlock 15% off with code GOBONKERS15`;
    }
    if (rawSubtotalCents < milestone3Cents) {
      const rem = milestone3Cents - rawSubtotalCents;
      return `Add items worth ${formatPrice(rem)} more to unlock 20% off with code BONKERS20`;
    }
    return `🎉 Maximum 20% tier unlocked! Use code BONKERS20 at checkout.`;
  }, [rawSubtotalCents, milestone1Cents, milestone2Cents, milestone3Cents]);

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

  // Focus trap + initial focus + return-focus while the drawer is open
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, closeCart);

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

  const applySpecificCode = (code: string) => {
    setCouponError('');
    const c = code.trim().toUpperCase();
    if (c === 'HUSTLE10' || c === 'ATELIER10') {
      setAppliedCoupon({ code: c, discountPercent: 10 });
      showToast({ title: 'Coupon Applied', description: '10% privilege savings applied.', type: 'success' });
    } else if (c === 'GOBONKERS15') {
      setAppliedCoupon({ code: c, discountPercent: 15 });
      showToast({ title: 'Coupon Applied', description: '15% tier savings applied.', type: 'success' });
    } else if (c === 'BONKERS20') {
      setAppliedCoupon({ code: c, discountPercent: 20 });
      showToast({ title: 'Coupon Applied', description: '20% maximum tier savings applied.', type: 'success' });
    } else if (c === 'NEEDLECRAFT') {
      setAppliedCoupon({ code: c, discountCents: 332000 });
      showToast({ title: 'Coupon Applied', description: '₹3,320 voucher applied.', type: 'success' });
    } else if (c === 'FREESHIP') {
      setAppliedCoupon({ code });
      showToast({ title: 'Coupon Applied', description: 'Complimentary shipping unlocked.', type: 'success' });
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applySpecificCode(couponCode);
    setCouponCode('');
  };

  const handleAddUpsell = (productSlug: string) => {
    const product = products?.find((p) => p.slug === productSlug);
    if (!product) return;
    const variant = getDefaultVariant(product);
    if (variant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out.`,
        type: 'info',
      });
      return;
    }
    addItem(product.slug, variant.sku, 1, undefined, variant.quantity ?? 99);
    showToast({
      title: 'Archival Care Added',
      description: `${product.name} (size ${variant.size})`,
      type: 'accent',
    });
  };

  const upsellProducts = useMemo(() => {
    if (!products) return [];
    const inCart = new Set(items.map((i) => i.productSlug));
    const accessories = products.filter(
      (p) => p.categorySlug === 'accessories' && !inCart.has(p.slug)
    );
    const pool = accessories.length > 0 ? accessories : products.filter((p) => !inCart.has(p.slug));
    return pool
      .filter((p) => getDefaultVariant(p).status !== 'out-of-stock')
      .slice(0, 2);
  }, [products, items]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      setOrderError('Please fill in your name, email and delivery address.');
      return;
    }
    if (!/^\d{6}$/.test(customerPincode)) {
      setOrderError('Please enter a valid 6-digit delivery PIN code.');
      return;
    }
    if (customerPhone && !/^[6-9]\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) {
      setOrderError('Please enter a valid 10-digit Indian mobile number, or leave phone empty.');
      return;
    }
    if (cartLines.length === 0) {
      setOrderError('Your bag is empty. Add a garment before checkout.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const res = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        pincode: customerPincode.trim(),
        paymentMethod,
        subtotalCents: rawSubtotalCents,
        discountCents,
        shippingCents: shippingCostCents,
        totalCents: finalTotalCents,
        couponCode: appliedCoupon?.code || null,
        giftNote: hasGiftNote ? giftNoteText : null,
        shippingAddress: shippingAddress.trim(),
        lines: cartLines.map((l) => ({
          productSlug: l.product.slug,
          variantSku: l.variant.sku,
          productName: l.product.name,
          color: l.variant.color,
          size: l.variant.size,
          quantity: l.quantity,
          priceCents: l.variant.priceCents,
          customization: l.customization,
        })),
      });
      if (!res.success) {
        setOrderError(res.message);
        return;
      }
      setPlacedOrderId(res.orderId || '');
      setCheckoutStep('success');
      clearCart();
      showToast({
        title: paymentMethod === 'cod' ? 'COD Order Confirmed' : 'Order Confirmed',
        description:
          paymentMethod === 'upi'
            ? 'Complete your UPI payment on the next step — invoice sent to your email.'
            : 'Your bespoke commission has been queued with the master needleworker.',
        type: 'success',
      });
    } finally {
      setIsPlacingOrder(false);
    }
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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className={`relative w-full max-w-md h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300 ${
          isV2 ? 'bg-[#f0f2f5] font-sans' : 'bg-paper'
        }`}
      >
        {isV2 ? (
          /* ─────────────────────────────────────────────────────────────
             v2 DESIGN SYSTEM BAG — Exact match to sketches/design system.png
             ───────────────────────────────────────────────────────────── */
          <>
            {/* Header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-200/80">
              <h3 className="font-sans font-bold text-lg text-gray-900 tracking-tight">
                Your Cart ({cartLines.reduce((acc, line) => acc + line.quantity, 0)} items)
              </h3>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="p-1.5 text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Top Promo Banner */}
            <button
              type="button"
              onClick={() => applySpecificCode('HUSTLE10')}
              className="w-full bg-black text-white py-2.5 px-4 text-center font-sans font-bold text-xs tracking-wider uppercase cursor-pointer hover:bg-neutral-900 transition-colors"
            >
              Get 10% off with code HUSTLE10
            </button>

            {/* Milestone Tiered Discount Tracker */}
            <div className="bg-white px-5 py-3 border-b border-gray-200/80 text-center">
              <p className="font-sans font-semibold text-xs text-gray-800 tracking-tight leading-snug">
                {v2MilestonePrompt}
              </p>

              {/* Progress Track & Nodes */}
              <div className="relative pt-5 pb-1 px-4 mt-1">
                {/* Background Connecting Line */}
                <div className="absolute top-[34px] left-8 right-8 h-1 bg-[#e2e4e8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${v2ProgressPercent}%` }}
                  />
                </div>

                {/* Nodes */}
                <div className="relative flex justify-between items-center z-10">
                  {/* Node 1 */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-sans font-medium text-gray-600 mb-1">₹500.00</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        rawSubtotalCents >= milestone1Cents ? 'bg-black border-black text-white' : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold">%</span>
                    </div>
                    <span className={`text-[10px] font-sans mt-1 ${rawSubtotalCents >= milestone1Cents ? 'font-bold text-black' : 'text-gray-500'}`}>
                      10% Off
                    </span>
                  </div>

                  {/* Node 2 */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-sans font-medium text-gray-600 mb-1">₹5,999.00</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        rawSubtotalCents >= milestone2Cents ? 'bg-black border-black text-white' : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold">%</span>
                    </div>
                    <span className={`text-[10px] font-sans mt-1 ${rawSubtotalCents >= milestone2Cents ? 'font-bold text-black' : 'text-gray-500'}`}>
                      15% Off
                    </span>
                  </div>

                  {/* Node 3 */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-sans font-medium text-gray-600 mb-1">₹9,999.00</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        rawSubtotalCents >= milestone3Cents ? 'bg-black border-black text-white' : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold">%</span>
                    </div>
                    <span className={`text-[10px] font-sans mt-1 ${rawSubtotalCents >= milestone3Cents ? 'font-bold text-black' : 'text-gray-500'}`}>
                      20% Off
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Middle Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 bg-[#f0f2f5]">
              {cartLines.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200/80 shadow-sm my-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-xl">
                    🛍
                  </div>
                  <h4 className="font-sans font-bold text-lg text-gray-900">Your Bag is Empty</h4>
                  <p className="font-sans text-xs text-gray-500 max-w-xs mx-auto">
                    Explore high-density embroidered drops, track pants, fleece hoodies and oversized tees.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={closeCart}
                    className="mt-2 bg-black hover:bg-neutral-900 text-white rounded-lg px-6"
                  >
                    <Link to="/shop">Explore Drops</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart Product Cards */}
                  <div>
                    {cartLines.map((line) => (
                      <CartLineItem
                        key={line.id}
                        line={line}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>

                  {/* Coupons & Offers Section */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 space-y-3">
                    {/* Row 1: Direct Coupon Quick-Apply */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-xs text-gray-900 tracking-wider">HUSTLE10</p>
                          <p className="font-sans text-[11px] text-emerald-600 truncate">
                            Applicable on Prepaid & COD orders. T&C Apply · save 10%
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => applySpecificCode('HUSTLE10')}
                        className={`px-4 py-1.5 rounded-md font-sans font-semibold text-xs transition-colors cursor-pointer flex-shrink-0 ${
                          appliedCoupon?.code === 'HUSTLE10'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#222222] hover:bg-black text-white'
                        }`}
                      >
                        {appliedCoupon?.code === 'HUSTLE10' ? 'Applied' : 'Apply'}
                      </button>
                    </div>

                    {/* Expandable Manual Coupon Input */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsCouponInputOpen(!isCouponInputOpen)}
                        className="text-xs font-sans font-medium text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>Enter coupon code</span>
                        <span className="text-[10px]">{isCouponInputOpen ? '▲' : '▼'}</span>
                      </button>

                      {isCouponInputOpen && (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter code (e.g. GOBONKERS15)"
                            className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 uppercase tracking-wider focus:outline-black"
                          />
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-md uppercase tracking-wider cursor-pointer"
                          >
                            Apply
                          </button>
                        </form>
                      )}
                      {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Row 2: View All Offers */}
                    <button
                      type="button"
                      onClick={() => setIsOffersModalOpen(true)}
                      className="w-full flex items-center justify-between pt-0.5 cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4m-14 0v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-xs text-gray-900">View all offers</p>
                          <p className="font-sans text-[11px] text-gray-500">Coupons · Payment Offers</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                          12
                        </span>
                        <span className="text-gray-400 group-hover:text-black font-bold">›</span>
                      </div>
                    </button>
                  </div>

                  {/* "You may also like..." Cross-sell section */}
                  {upsellProducts.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 space-y-3">
                      <h4 className="font-sans font-bold text-sm text-gray-900">
                        You may also like...
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {upsellProducts.map((up, idx) => {
                          const uv = getDefaultVariant(up);
                          const simOriginal = Math.round(uv.priceCents * 1.35);
                          const discountTag = idx === 0 ? '36% off' : '20% off';
                          return (
                            <div
                              key={up.slug}
                              className="border border-gray-200 rounded-xl p-2.5 flex flex-col justify-between hover:border-gray-400 transition-colors bg-white"
                            >
                              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-50 mb-2">
                                <img
                                  src={up.images[0]?.src || '/images/placeholders/hero.jpg'}
                                  alt={up.name}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm whitespace-nowrap">
                                  {discountTag}
                                </span>
                              </div>

                              <div>
                                <h5 className="font-sans font-semibold text-xs text-gray-900 truncate">
                                  {up.name}
                                </h5>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="font-sans text-[11px] text-gray-400 line-through">
                                    {formatPrice(simOriginal)}
                                  </span>
                                  <span className="font-sans font-bold text-xs text-gray-900">
                                    {formatPrice(uv.priceCents)}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddUpsell(up.slug)}
                                className="w-full mt-2 py-1.5 border border-black text-black hover:bg-black hover:text-white rounded-md text-xs font-semibold font-sans transition-colors cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sticky Bottom Checkout Footer */}
            {cartLines.length > 0 && (
              <div className="relative">
                {/* Floating Saved Banner on top */}
                <div className="flex justify-center -mb-2 relative z-20 pointer-events-none">
                  <span className="bg-black text-white font-sans text-xs font-bold py-1 px-5 rounded-t-lg tracking-wide shadow-md">
                    {formatPrice(totalSavingsCents)} Saved so far!
                  </span>
                </div>

                {/* Main Checkout Panel */}
                <div className="bg-white p-4 pt-3.5 border-t border-gray-200/80 shadow-2xl space-y-2.5">
                  {/* Estimated Total Line */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 cursor-pointer text-gray-800 font-sans font-bold text-sm">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Estimated Total</span>
                      <span className="text-[10px] text-gray-500">⌄</span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans text-xs text-gray-400 line-through">
                        {formatPrice(simulatedOriginalTotalCents)}
                      </span>
                      <span className="font-sans font-bold text-lg text-gray-900">
                        {formatPrice(finalTotalCents)}
                      </span>
                      <span className="font-sans font-bold text-xs text-emerald-600">
                        (21% OFF)
                      </span>
                    </div>
                  </div>

                  {/* Value Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium">
                      🚚 Incl. ~₹50.00 est. shipping
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold">
                      ✓ Save up to ₹74.95 on Prepaid
                    </span>
                  </div>

                  {/* Solid Black CHECKOUT Button with Payment Partner Logos */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-black hover:bg-neutral-900 text-white rounded-xl py-2.5 px-4 flex items-center justify-between shadow-md transition-all cursor-pointer group"
                  >
                    <div className="text-left">
                      <span className="font-sans font-bold text-sm tracking-wider uppercase block text-white">
                        CHECKOUT
                      </span>
                      <span className="font-sans text-[10px] text-gray-300 tracking-wide uppercase block">
                        5% OFF ON PREPAID ORDERS
                      </span>
                    </div>

                    {/* Partner Logos Pill */}
                    <div className="bg-white rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                      <span className="text-[10px] font-black tracking-tighter text-[#00b9f5] leading-none">
                        Pay<span className="text-[#002e6e]">tm</span>
                      </span>
                      <span className="w-px h-3 bg-gray-200" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        पे
                      </span>
                      <span className="w-px h-3 bg-gray-200" />
                      <span className="text-[10px] font-bold text-gray-700 leading-none flex items-center">
                        <span className="text-[#4285f4]">G</span>Pay
                      </span>
                    </div>
                  </button>

                  {/* Gokwik Brand Attribution */}
                  <div className="flex items-center justify-center gap-1 text-[11px] font-sans text-gray-500 pt-1">
                    <span>Powered by</span>
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                      <span className="inline-block w-2.5 h-2.5 rotate-45 bg-gradient-to-tr from-[#ff6b00] to-[#00b9f5] rounded-xs" />
                      <span>GoKwik</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             v1 THE ATELIER BAG — Quiet-luxury haute needlecraft aesthetic
             ───────────────────────────────────────────────────────────── */
          <>
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
                className="p-1.5 text-ink-muted hover:text-ink transition-colors cursor-pointer"
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
                  {upsellProducts.length > 0 && (
                    <div className="py-5">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-medium block mb-2.5">
                        ✦ Frequently Stitched Together
                      </span>
                      <div className="space-y-3">
                        {upsellProducts.map((up) => {
                          const uv = getDefaultVariant(up);
                          return (
                            <div key={up.slug} className="flex items-center gap-3 p-2.5 bg-cream/70 border border-stone/70 rounded-sm">
                              <img src={up.images[0]?.src || '/images/placeholders/hero.jpg'} alt={up.name} className="w-12 h-12 object-cover border border-stone/60" />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-serif text-xs text-ink truncate">{up.name}</h5>
                                <span className="text-[11px] font-sans text-ink-muted font-medium">{formatPrice(uv.priceCents)}</span>
                              </div>
                              <button
                                onClick={() => handleAddUpsell(up.slug)}
                                aria-label={`Add ${up.name} to bag`}
                                className="px-2.5 py-1 min-h-[44px] text-[10px] uppercase tracking-wider bg-ink text-cream hover:bg-accent transition-colors font-medium whitespace-nowrap cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                        className="text-[10px] uppercase text-ink-muted hover:text-ink cursor-pointer"
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
                        className="px-3 py-1.5 bg-stone/70 hover:bg-ink hover:text-cream text-xs text-ink uppercase tracking-wider transition-colors font-medium cursor-pointer"
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
                    <span>{freeShippingQualified ? 'Complimentary' : formatPrice(STANDARD_SHIPPING_CENTS)}</span>
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
          </>
        )}
      </div>

      {/* Offers Sheet / Modal for v2 */}
      {isOffersModalOpen && (
        <div className="fixed inset-0 z-[480] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setIsOffersModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h4 className="font-sans font-bold text-base text-gray-900">Available Offers (12)</h4>
              <button
                onClick={() => setIsOffersModalOpen(false)}
                className="p-1 text-gray-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { code: 'HUSTLE10', title: '10% OFF on all drops', desc: 'Valid on prepaid and COD orders above ₹500.' },
                { code: 'GOBONKERS15', title: '15% OFF Tier Reward', desc: 'Unlocked on cart value ₹5,999+.' },
                { code: 'BONKERS20', title: '20% OFF Maximum Tier', desc: 'Unlocked on cart value ₹9,999+.' },
                { code: 'FREESHIP', title: 'Complimentary Express Delivery', desc: 'Pan-India free shipping with no minimum.' },
              ].map((offer) => (
                <div key={offer.code} className="border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded border border-gray-300">
                      {offer.code}
                    </span>
                    <p className="font-sans font-semibold text-xs text-gray-900 mt-1">{offer.title}</p>
                    <p className="font-sans text-[11px] text-gray-500">{offer.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      applySpecificCode(offer.code);
                      setIsOffersModalOpen(false);
                    }}
                    className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-md hover:bg-neutral-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  <button onClick={() => setIsCheckoutOpen(false)} aria-label="Close checkout" className="min-w-[44px] min-h-[44px] px-2 text-xs text-ink-muted hover:text-ink">✕</button>
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

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  {savedAddresses.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">Deliver to a saved address</p>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((a) => {
                          const selected = selectedAddressId === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => applyAddress(a.id)}
                              aria-pressed={selected}
                              className={`text-left px-3 py-2 border min-h-[44px] transition-colors cursor-pointer ${
                                selected
                                  ? 'border-ink bg-cream'
                                  : 'border-stone hover:border-ink/60 bg-paper'
                              }`}
                            >
                              <span className="block text-[11px] font-medium text-ink">{a.recipient_name}</span>
                              <span className="block text-[10px] text-ink-muted mt-0.5">
                                {a.city} {a.pincode}
                              </span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null);
                            setShippingAddress('');
                            setCustomerPincode('');
                          }}
                          className="text-left px-3 py-2 border border-dashed border-stone hover:border-ink/60 min-h-[44px] transition-colors cursor-pointer"
                        >
                          <span className="block text-[11px] text-ink-muted">New address</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="co-name" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        id="co-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="co-phone" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                        Mobile (10-digit)
                      </label>
                      <input
                        id="co-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="e.g. 9810012345"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="co-email" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="co-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. ananya@example.in"
                      className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="co-pincode" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                        PIN Code
                      </label>
                      <input
                        id="co-pincode"
                        type="text"
                        required
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={customerPincode}
                        onChange={(e) => setCustomerPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 110001"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                        Payment
                      </span>
                      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Payment method">
                        {(
                          [
                            { key: 'upi', label: 'UPI' },
                            { key: 'cod', label: 'COD' },
                            { key: 'card', label: 'Card' },
                          ] as { key: PaymentMethod; label: string }[]
                        ).map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            role="radio"
                            aria-checked={paymentMethod === m.key}
                            onClick={() => setPaymentMethod(m.key)}
                            className={`min-h-[44px] px-2 text-xs border transition-colors ${
                              paymentMethod === m.key
                                ? 'bg-ink text-cream border-ink font-medium'
                                : 'bg-paper text-ink border-stone hover:border-ink/60'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="co-address" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      id="co-address"
                      required
                      rows={2}
                      autoComplete="street-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Flat, street, area, city, state"
                      className="w-full bg-cream border border-stone px-3 py-2.5 text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  {hasGiftNote && (
                    <div>
                      <label htmlFor="co-gift" className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                        Gift Note
                      </label>
                      <input
                        id="co-gift"
                        type="text"
                        value={giftNoteText}
                        onChange={(e) => setGiftNoteText(e.target.value)}
                        placeholder="Handwritten note for the recipient"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-paper border border-stone/70 text-[11px] text-ink-muted leading-relaxed">
                    <span className="text-ink font-medium block">✦ White-Glove Courier Service</span>
                    {paymentMethod === 'upi' && 'You will receive a UPI collect request after placing the order. '}
                    {paymentMethod === 'cod' && 'Pay in cash or via UPI on delivery. Please keep exact change ready. '}
                    {paymentMethod === 'card' && 'Secure RuPay / Visa / Mastercard payment link will be emailed. '}
                    Dispatch in 2 business days. Inclusive of all taxes.
                  </div>

                  {orderError && (
                    <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                      {orderError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                      Back to Bag
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={isPlacingOrder}>
                      {isPlacingOrder ? 'Placing Order…' : `Pay ${paymentMethod.toUpperCase()} • ${formatPrice(finalTotalCents)}`}
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
                {placedOrderId && (
                  <p className="text-[11px] font-mono text-ink-muted mt-2">Order ID: {placedOrderId}</p>
                )}
                <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                  {placedOrderId && (
                    <Link
                      to={`/order-confirmation/${placedOrderId}?email=${encodeURIComponent(customerEmail)}`}
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        closeCart();
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-mono uppercase tracking-wider bg-ink text-cream hover:bg-ink-light transition-colors"
                    >
                      View Archival Receipt & Tracking ↗
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCheckoutStep('details');
                      setPlacedOrderId('');
                      setCustomerName('');
                      setCustomerEmail('');
                      setCustomerPhone('');
                      setCustomerPincode('');
                      setShippingAddress('');
                      setGiftNoteText('');
                      setHasGiftNote(false);
                      setIsCheckoutOpen(false);
                      closeCart();
                    }}
                  >
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
