import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { getOrderDetails, formatPrice } from '../lib/data';
import { useToastStore } from '../stores/toast';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

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
        setErrorMessage(res.message || 'No matching order could be found.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with order service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeOrderId && emailParam) {
      void fetchOrder(routeOrderId, emailParam);
    }
  }, [routeOrderId, emailParam]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = routeOrderId || inputOrderId.trim();
    if (!idToUse || !inputEmail.trim()) {
      setErrorMessage('Order reference and email are both required.');
      return;
    }
    startTransition(() => {
      setSearchParams({ email: inputEmail.trim() });
    });
    void fetchOrder(idToUse, inputEmail.trim());
  };

  const handleCopyId = () => {
    if (!activeOrderId) return;
    navigator.clipboard.writeText(activeOrderId);
    setCopied(true);
    showToast({
      title: 'Order ID Copied',
      description: activeOrderId,
      type: 'info',
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
    <div className="min-h-screen w-full bg-white text-neutral-900 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-black transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-black">Receipt</span>
        </nav>

        {!order && !isLoading && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Verification</span>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-neutral-900 mt-1">
              Find Your Order
            </h1>
            <p className="mt-1 text-xs text-neutral-500 max-w-md">
              {routeOrderId ? (
                <>Enter the email address you purchased with to inspect #{routeOrderId.slice(0, 8).toUpperCase()}.</>
              ) : (
                'Enter your order reference ID and email address to view tracking and invoice.'
              )}
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLookupSubmit} className="mt-6 space-y-4 max-w-md">
              {!routeOrderId && (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Order Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    placeholder="e.g. 848d7986..."
                    className="min-h-[42px] w-full rounded-xs border border-neutral-300 bg-neutral-50 px-3 text-xs text-neutral-900 focus:border-black focus:bg-white focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="min-h-[42px] w-full rounded-xs border border-neutral-300 bg-neutral-50 px-3 text-xs text-neutral-900 focus:border-black focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
              >
                Inspect Order Record →
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="py-20 text-center">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Retrieving Order Details…</p>
          </div>
        )}

        {order && !isLoading && (
          <div>
            {/* Confirmation Banner */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-xl">
                    ✓
                  </div>
                  <div>
                    <span className="rounded-xs bg-emerald-100 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-800">
                      ORDER CONFIRMED
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-neutral-900 mt-1">
                      Thank You, {order.customer_name}
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Confirmation dispatch recorded on {formattedDate}.
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-neutral-200 bg-white p-3 text-left sm:text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Reference ID</p>
                  <div className="flex items-center gap-2 mt-0.5 sm:justify-end">
                    <span className="font-mono text-sm font-black text-neutral-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="rounded-xs border border-neutral-300 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-700 hover:border-black"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase text-neutral-500">
                    Status: <strong className="text-black">{order.status.replace(/-/g, ' ')}</strong>
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Step 1</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Order Verified</p>
                    <p className="text-[11px] text-neutral-500">Received &amp; queued</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Step 2</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Workshop Stitching</p>
                    <p className="text-[11px] text-neutral-500">Needlework allocation</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Step 3</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Dispatch Window</p>
                    <p className="text-[11px] text-neutral-500">Leaves in 4–7 days</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Step 4</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Doorstep Delivery</p>
                    <p className="text-[11px] text-neutral-500">7-Day easy exchange</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Details Breakdown */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Items List */}
              <div className="lg:col-span-7">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  Ordered Silhouettes ({items.length})
                </h2>
                <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.product_slug}`}
                          className="font-bold uppercase text-xs text-neutral-900 hover:text-red-600 transition-colors"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {[item.color, item.size ? `Size ${item.size}` : null, `Qty ${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                          {item.variant_sku}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-xs text-neutral-900">
                          {formatPrice(item.price_cents * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {formatPrice(item.price_cents)} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.gift_note && (
                  <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gift Note</span>
                    <p className="text-xs text-neutral-800 mt-1 italic">"{order.gift_note}"</p>
                  </div>
                )}
              </div>

              {/* Price Breakdown & Delivery Address */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                    Payment Summary
                  </h3>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <dt>Subtotal</dt>
                      <dd className="font-bold text-neutral-900">{formatPrice(order.subtotal_cents)}</dd>
                    </div>
                    {order.discount_cents > 0 && (
                      <div className="flex justify-between text-red-600">
                        <dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</dt>
                        <dd className="font-bold">–{formatPrice(order.discount_cents)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-600">
                      <dt>Shipping</dt>
                      <dd className="font-bold text-neutral-900">
                        {order.shipping_cents === 0 ? 'FREE' : formatPrice(order.shipping_cents)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-2.5 text-sm font-black text-neutral-900">
                      <dt>Total</dt>
                      <dd className="text-red-600">{formatPrice(order.total_cents)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[11px] text-neutral-500 border-t border-neutral-100 pt-2.5">
                    {paymentMethod === 'cod'
                      ? `Cash on delivery. Please keep ${formatPrice(order.total_cents)} ready at handover.`
                      : 'Paid online securely. Your transaction is verified.'}
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">
                    Shipping Address
                  </h3>
                  <div className="text-xs text-neutral-600 leading-relaxed">
                    <p className="font-bold text-neutral-900">{order.customer_name}</p>
                    <p className="mt-0.5">{deliveryAddress}</p>
                    {deliveryPincode && <p>PIN: {deliveryPincode}</p>}
                    {deliveryPhone && <p>Phone: {deliveryPhone}</p>}
                    <p className="mt-2 text-[11px] text-neutral-400">Tracking updates dispatched to {order.customer_email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full min-h-[42px] rounded-xs border border-neutral-300 bg-white px-4 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black transition"
                  >
                    Print Receipt 🖨
                  </button>
                  <Link
                    to="/shop"
                    className="w-full min-h-[44px] inline-flex items-center justify-center rounded-xs bg-black px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
                  >
                    Continue Shopping →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <TrustBadgesPreFooter />
    </div>
  );
};
