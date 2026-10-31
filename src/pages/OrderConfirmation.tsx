import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { getOrderDetails, formatPrice } from '../lib/data';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../stores/toast';

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  coupon_code: string | null;
  gift_note: string | null;
  shipping_address: any;
  created_at: string;
}

interface OrderItemRecord {
  id: string;
  product_slug: string;
  variant_sku: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  price_cents: number;
  customization?: any;
}

export const OrderConfirmation: React.FC = () => {
  const { orderId: routeOrderId } = useParams<{ orderId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [inputOrderId, setInputOrderId] = useState(routeOrderId || '');
  const [inputEmail, setInputEmail] = useState(emailParam);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const showToast = useToastStore((s) => s.showToast);

  const activeOrderId = order?.id || routeOrderId || inputOrderId.trim();

  const fetchOrder = async (targetId: string, emailToUse: string) => {
    if (!targetId || !emailToUse.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await getOrderDetails(targetId, emailToUse.trim());
      if (res.success && res.data) {
        setOrder(res.data.order);
        setItems(res.data.items || []);
      } else {
        setErrorMessage(
          res.message ||
            'Order not found or the email provided does not match this commission record.'
        );
      }
    } catch {
      setErrorMessage('Could not load order details. Please check connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeOrderId && emailParam) {
      startTransition(() => {
        fetchOrder(routeOrderId, emailParam);
      });
    }
  }, [routeOrderId, emailParam]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = routeOrderId || inputOrderId.trim();
    const targetEmail = inputEmail.trim();
    if (!targetId || !targetEmail) return;
    setSearchParams({ email: targetEmail });
    fetchOrder(targetId, targetEmail);
  };

  const handleCopyId = () => {
    if (!activeOrderId) return;
    navigator.clipboard.writeText(activeOrderId);
    setCopied(true);
    showToast({
      title: 'Order ID Copied',
      description: 'Reference copied to clipboard for concierge tracking.',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const addressObj = order?.shipping_address;
  const deliveryAddress =
    typeof addressObj === 'object' && addressObj !== null
      ? addressObj.address || JSON.stringify(addressObj)
      : addressObj || 'Standard Courier Address';
  const deliveryPhone =
    typeof addressObj === 'object' && addressObj !== null ? addressObj.phone : null;
  const deliveryPincode =
    typeof addressObj === 'object' && addressObj !== null ? addressObj.pincode : null;
  const paymentMethod =
    typeof addressObj === 'object' && addressObj !== null
      ? addressObj.payment_method || 'upi'
      : 'upi';

  return (
    <div className="bg-cream min-h-screen py-12 lg:py-20 text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            to="/"
            className="text-[11px] font-mono tracking-widest uppercase text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span> Return to Atelier Storefront
          </Link>
        </nav>

        {/* Email Verification Form if order not yet loaded */}
        {!order && !isLoading && (
          <div className="bg-paper border border-stone/50 p-8 sm:p-12 shadow-sm rounded-none">
            <div className="max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent font-serif text-xl flex items-center justify-center mx-auto mb-4">
                ✦
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                Atelier Order Vault
              </h1>
              <p className="text-xs text-ink-muted mt-2.5 leading-relaxed font-sans">
                {routeOrderId ? (
                  <>
                    Please enter the collector email associated with order reference{' '}
                    <span className="font-mono text-ink font-medium break-all">{routeOrderId}</span> to
                    retrieve your verified archival receipt.
                  </>
                ) : (
                  'Enter your Order ID and associated collector email to retrieve your verified archival receipt.'
                )}
              </p>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50/80 border border-red-200 text-red-800 text-xs rounded-none text-left">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLookupSubmit} className="mt-6 space-y-3">
                {!routeOrderId && (
                  <input
                    type="text"
                    required
                    placeholder="Order ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream border border-stone text-xs text-ink focus:outline-none focus:border-ink font-mono"
                  />
                )}
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream border border-stone text-xs text-ink focus:outline-none focus:border-ink font-mono"
                />
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Access Commission Record
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-lg text-ink-muted animate-pulse">
              Retrieving archival needlecraft records…
            </p>
          </div>
        )}

        {/* Full Verified Order Confirmation Screen */}
        {order && !isLoading && (
          <div className="space-y-8">
            {/* Header / Archival Commission Certificate */}
            <div className="bg-paper border border-stone/50 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent font-medium">
                    Archival Commission Receipt
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal mt-1">
                    Commission Confirmed
                  </h1>
                  <p className="text-xs text-ink-muted mt-1 font-sans">
                    Assigned to UniqueLo needlecraft guild • {formattedDate}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                    Order Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-medium text-ink bg-cream px-2.5 py-1 border border-stone/40">
                      {order.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider bg-ink text-cream hover:bg-ink-light transition-colors"
                      title="Copy Reference"
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-Stage Atelier Lifecycle Tracker */}
              <div className="mt-8 pt-2">
                <p className="text-[11px] font-mono uppercase tracking-widest text-ink-muted mb-4">
                  Needlecraft & Delivery Trajectory
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
                  <div className="p-3 bg-cream/70 border border-emerald-300/60 rounded-none relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mb-2" />
                    <span className="text-[11px] font-sans font-medium text-ink block">
                      1. Commission Logged
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">
                      Confirmed & Vaulted
                    </span>
                  </div>

                  <div className="p-3 bg-cream border border-accent/40 rounded-none relative">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse mb-2" />
                    <span className="text-[11px] font-sans font-medium text-ink block">
                      2. Loom & Artisan Queue
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">
                      Guild master allocated
                    </span>
                  </div>

                  <div className="p-3 bg-paper border border-stone/30 rounded-none opacity-60">
                    <div className="w-2 h-2 rounded-full bg-stone/60 mb-2" />
                    <span className="text-[11px] font-sans font-medium text-ink block">
                      3. Macro Relief Audit
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">
                      Stitch tension & density
                    </span>
                  </div>

                  <div className="p-3 bg-paper border border-stone/30 rounded-none opacity-60">
                    <div className="w-2 h-2 rounded-full bg-stone/60 mb-2" />
                    <span className="text-[11px] font-sans font-medium text-ink block">
                      4. White-Glove Dispatch
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">
                      Insured express courier
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Details: Left (Items List), Right (Payment & Shipping) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Itemized Garments List */}
              <div className="lg:col-span-7 bg-paper border border-stone/50 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-xl text-ink font-normal pb-3 border-b border-stone/30">
                  Itemized Atelier Pieces ({items.length})
                </h2>

                <div className="divide-y divide-stone/30">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <div className="w-16 h-20 bg-cream border border-stone/40 flex-shrink-0 flex items-center justify-center font-serif text-xl text-ink-muted">
                        ✦
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product_slug}`}
                          className="font-serif text-base text-ink hover:text-accent transition-colors block truncate"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                          Variant: {item.color} • Size {item.size} • Qty {item.quantity}
                        </p>
                        <p className="text-[10px] font-mono text-ink-muted/80 mt-0.5">
                          SKU: {item.variant_sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-sm font-medium text-ink">
                          {formatPrice(item.price_cents * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] font-mono text-ink-muted block">
                            ({formatPrice(item.price_cents)} each)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift Note if present */}
                {order.gift_note && (
                  <div className="p-3.5 bg-cream/80 border border-stone/40 mt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-medium block">
                      Archival Gift Note
                    </span>
                    <p className="font-serif italic text-xs text-ink mt-1">"{order.gift_note}"</p>
                  </div>
                )}
              </div>

              {/* Delivery & Financial Summary */}
              <div className="lg:col-span-5 space-y-6">
                {/* Fulfillment Destination Card */}
                <div className="bg-paper border border-stone/50 p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg text-ink font-normal pb-2 border-b border-stone/30">
                    Fulfillment Destination
                  </h3>
                  <div className="text-xs space-y-1.5 font-sans">
                    <p className="font-medium text-ink">{order.customer_name}</p>
                    <p className="text-ink-muted">{order.customer_email}</p>
                    {deliveryPhone && <p className="text-ink-muted">Tel: {deliveryPhone}</p>}
                    <p className="text-ink mt-2 pt-2 border-t border-stone/20 leading-relaxed font-mono text-[11px]">
                      {deliveryAddress}
                    </p>
                    {deliveryPincode && (
                      <p className="text-accent font-mono text-[11px]">PIN: {deliveryPincode}</p>
                    )}
                  </div>
                </div>

                {/* Financial Breakdown Card */}
                <div className="bg-paper border border-stone/50 p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg text-ink font-normal pb-2 border-b border-stone/30">
                    Payment & Settlement
                  </h3>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between text-ink-muted">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatPrice(order.subtotal_cents)}</span>
                    </div>

                    {order.discount_cents > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>
                          Atelier Promotion {order.coupon_code ? `(${order.coupon_code})` : ''}
                        </span>
                        <span className="font-mono">–{formatPrice(order.discount_cents)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-ink-muted">
                      <span>Express White-Glove Shipping</span>
                      <span className="font-mono">
                        {order.shipping_cents === 0
                          ? 'Complimentary'
                          : formatPrice(order.shipping_cents)}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-serif text-ink pt-3 border-t border-stone/30">
                      <span>Total Transacted</span>
                      <span className="font-mono font-medium">{formatPrice(order.total_cents)}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone/20">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-1">
                        Settlement Method
                      </span>
                      {paymentMethod === 'cod' ? (
                        <div className="p-2.5 bg-cream border border-stone/40 text-[11px] text-ink font-sans">
                          <strong>Cash on Delivery (COD):</strong> Please keep exact cash of{' '}
                          <span className="font-mono font-medium text-accent">
                            {formatPrice(order.total_cents)}
                          </span>{' '}
                          ready at the time of courier handover.
                        </div>
                      ) : (
                        <div className="p-2.5 bg-cream border border-stone/40 text-[11px] text-ink font-sans">
                          <strong>Paid online:</strong> Settled through Razorpay. Your card and UPI
                          details were entered on their secure page and are never stored by
                          UniqueLo.
                          {paymentMethod === 'upi' && (
                            <>
                              {' '}
                              <span className="text-ink-muted">
                                (Earlier orders were recorded against a UPI handle; the payment
                                gateway is now the only online route.)
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Print and Return Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => window.print()}
                  >
                    Print Archival Certificate ⎙
                  </Button>
                  <Link to="/" className="w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Return to Atelier Collection
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
