import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { getOrderDetails, formatPrice } from '../lib/data';
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
    <div className="bg-cream min-h-screen py-12 lg:py-14 text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Navigation */}
        <nav aria-label="Breadcrumb" className="loom-label mb-6 text-ink-muted">
          <Link to="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-ink">Your order</span>
        </nav>

        {/* Order lookup — a receipt is retrieved by the buyer's own email, so
            a guessed order id alone opens nothing. */}
        {!order && !isLoading && (
          <div className="border-t border-stone pt-6">
            <p className="loom-label text-ink-muted">Order record</p>
            <h1 className="loom-display mt-2 text-ink" style={{ fontSize: 'var(--text-display)' }}>
              Find your order
            </h1>
            <p className="mt-2 max-w-[54ch] font-sans text-[15px] leading-relaxed text-ink-muted">
              {routeOrderId ? (
                <>
                  Enter the email you ordered with to open order{' '}
                  <span className="loom-price text-ink">{routeOrderId.slice(0, 8)}</span>.
                </>
              ) : (
                'Enter the order reference and the email you ordered with.'
              )}
            </p>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 max-w-[54ch] border-l-2 border-accent pl-3 font-sans text-[13px] leading-relaxed text-accent"
              >
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleLookupSubmit} className="mt-6 grid max-w-xl gap-3">
              {!routeOrderId && (
                <label className="block">
                  <span className="loom-label text-ink-muted">Order reference</span>
                  <input
                    type="text"
                    required
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    placeholder="The reference from your confirmation"
                    className="loom-price mt-1.5 min-h-[44px] w-full border border-stone bg-paper px-3 text-[13px] text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-ink focus:outline-none"
                  />
                </label>
              )}
              <label className="block">
                <span className="loom-label text-ink-muted">Email</span>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="mt-1.5 min-h-[44px] w-full border border-stone bg-paper px-3 font-sans text-[13px] text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="mt-1 min-h-[48px] w-fit bg-ink px-5 font-sans text-[12px] uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
              >
                Open the record
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="border-t border-stone pt-6">
            <p className="loom-label text-ink-muted">Reading the record</p>
            <p className="mt-2 font-sans text-[15px] text-ink">One moment.</p>
          </div>
        )}

        {order && !isLoading && (
          <div>
            {/* Head: the receipt's own facts, no certificate theatre. */}
            <div className="border-t border-stone pt-6">
              <nav aria-label="Breadcrumb" className="loom-label text-ink-muted">
                <Link to="/orders" className="transition-colors hover:text-ink">
                  Orders
                </Link>
                <span aria-hidden="true" className="mx-2">
                  /
                </span>
                <span className="text-ink">This order</span>
              </nav>

              <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h1
                    className="loom-display text-ink"
                    style={{ fontSize: 'var(--text-display)' }}
                  >
                    Order placed
                  </h1>
                  <p className="mt-2 max-w-[52ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                    {order.customer_name}, this is the record of what you bought
                    and what it cost. Placed {formattedDate}.
                  </p>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="loom-label text-ink-muted">Reference</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="loom-price text-[13px] text-ink">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="min-h-[44px] border border-stone-strong px-2.5 font-sans text-[10.5px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1.5 font-sans text-[11.5px] text-ink-muted">
                    Status:{' '}
                    <span className="text-ink">{order.status.replace(/-/g, ' ')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next, from the same four terms the footer states —
                dispatch window, COD, returns, carriage — not a four-step
                "lifecycle" invented for the page. */}
            <dl className="mt-8 grid grid-cols-1 border-t border-stone sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Next', 'Packed and dispatched from the workshop'],
                ['Dispatch window', '4–7 days from the order'],
                ['Returns', `7 days from delivery`],
                ['Payment', paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'],
              ].map(([term, def], i) => (
                <div
                  key={term}
                  className={`border-b border-stone py-4 sm:border-b-0 ${
                    i > 0 ? 'lg:border-l lg:pl-5' : 'lg:pr-5'
                  } ${i % 2 === 1 ? 'sm:border-l sm:pl-5' : ''}`}
                >
                  <dt className="loom-label text-ink-muted">{term}</dt>
                  <dd className="mt-1 font-sans text-[13px] leading-snug text-ink">{def}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Items */}
              <div className="lg:col-span-7">
                <h2 className="loom-label text-ink-muted">
                  {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                </h2>
                <ol className="mt-3 border-t border-stone">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 border-b border-stone py-4"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.product_slug}`}
                          className="font-sans text-[14px] leading-snug text-ink transition-colors hover:text-accent"
                        >
                          {item.product_name}
                        </Link>
                        <p className="loom-label mt-1.5 text-ink-muted">
                          {[item.color, item.size ? `size ${item.size}` : null, `qty ${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <p className="loom-price mt-0.5 text-[11px] text-ink-muted">
                          {item.variant_sku}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="loom-price text-[13.5px] text-ink">
                          {formatPrice(item.price_cents * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="loom-price mt-0.5 text-[11px] text-ink-muted">
                            {formatPrice(item.price_cents)} each
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {order.gift_note && (
                  <div className="mt-4 border-l-2 border-accent pl-3">
                    <p className="loom-label text-ink-muted">Gift note</p>
                    <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink">
                      {order.gift_note}
                    </p>
                  </div>
                )}
              </div>

              {/* Totals + delivery */}
              <div className="lg:col-span-5">
                <h2 className="loom-label text-ink-muted">What it cost</h2>
                <dl className="mt-3 border-t border-stone font-sans text-[13px]">
                  <div className="flex justify-between gap-4 border-b border-stone py-2.5">
                    <dt className="text-ink-muted">Subtotal</dt>
                    <dd className="loom-price text-ink">{formatPrice(order.subtotal_cents)}</dd>
                  </div>
                  {order.discount_cents > 0 && (
                    <div className="flex justify-between gap-4 border-b border-stone py-2.5">
                      <dt className="text-ink-muted">
                        Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
                      </dt>
                      <dd className="loom-price text-ink">
                        –{formatPrice(order.discount_cents)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-b border-stone py-2.5">
                    <dt className="text-ink-muted">Carriage</dt>
                    <dd className="loom-price text-ink">
                      {order.shipping_cents === 0 ? 'Waived' : formatPrice(order.shipping_cents)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-stone py-3">
                    <dt className="font-sans text-[13px] text-ink">Total</dt>
                    <dd className="loom-price text-[17px] text-ink">
                      {formatPrice(order.total_cents)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 font-sans text-[12px] leading-relaxed text-ink-muted">
                  {paymentMethod === 'cod'
                    ? `Cash on delivery. Have ${formatPrice(order.total_cents)} ready at handover.`
                    : 'Paid online through Razorpay. Card and UPI details were entered on their page, never stored here.'}
                </p>

                <h2 className="mt-8 loom-label text-ink-muted">Delivering to</h2>
                <address className="mt-2 border-t border-stone pt-3 font-sans text-[13px] not-italic leading-relaxed text-ink">
                  {order.customer_name}
                  <br />
                  <span className="text-ink-muted">{deliveryAddress}</span>
                  {deliveryPincode && (
                    <>
                      <br />
                      <span className="loom-price text-ink-muted">PIN {deliveryPincode}</span>
                    </>
                  )}
                  {deliveryPhone && (
                    <>
                      <br />
                      <span className="loom-price text-ink-muted">{deliveryPhone}</span>
                    </>
                  )}
                </address>
                <p className="mt-1 font-sans text-[12px] text-ink-muted">
                  Confirmation sent to {order.customer_email}
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[44px] border border-stone-strong px-4 font-sans text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
                  >
                    Print this order
                  </button>
                  <Link
                    to="/shop"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-ink px-5 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
                  >
                    Back to the collection
                    <span aria-hidden="true">→</span>
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
