import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import { formatPrice } from '../lib/data';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

interface OrderRow {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  order_items: { id: string; product_name: string; variant_sku: string; quantity: number; price_cents: number }[];
}

export const Orders: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openModal);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;
    let cancelled = false;

    void (async () => {
      const { data, error: err } = await supabase
        .from('orders')
        .select('id, status, total_cents, created_at, order_items(id, product_name, variant_sku, quantity, price_cents)')
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (err) {
        setError(err.message);
        setOrders([]);
        return;
      }
      setOrders((data ?? []) as unknown as OrderRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Your Account</p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
            Sign in to view orders
          </h1>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
            Your purchases and shipment tracking live with your account. Ordered as a guest? Track it instantly with your order ID.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
            >
              Sign In
            </button>
            <Link
              to="/track-order"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xs border border-neutral-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black transition"
            >
              Track Guest Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-black">Orders</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">
              Order History
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              All your placed drops, custom needlework pieces, and shipment records.
            </p>
          </div>
          {orders && orders.length > 0 && (
            <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          )}
        </div>

        {orders === null && (
          <div className="py-16 text-center text-xs text-neutral-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent mb-2" />
            <p>Loading your orders…</p>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            Could not load orders: {error}
          </div>
        )}

        {orders && orders.length === 0 && !error && (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="font-display text-xl font-bold uppercase text-neutral-900">No orders yet</p>
            <p className="text-xs text-neutral-500 mt-1">Pieces you order while signed in will appear here with live tracking.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
            >
              Explore Fresh Drops →
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="mt-6 space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Placed {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <p className="font-mono text-xs font-bold text-neutral-900 mt-0.5">#{o.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="rounded-xs bg-neutral-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      {o.status.replace(/-/g, ' ')}
                    </span>
                    <span className="font-display text-sm font-black text-neutral-900">
                      {formatPrice(o.total_cents)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <ul className="divide-y divide-neutral-100 px-5">
                  {(o.order_items ?? []).map((item) => (
                    <li key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold uppercase text-neutral-900">{item.product_name}</p>
                        <p className="text-[11px] text-neutral-400">SKU: {item.variant_sku}</p>
                      </div>
                      <span className="font-medium text-neutral-600">
                        Qty {item.quantity} · {formatPrice(item.price_cents)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer Action */}
                <div className="flex items-center justify-between border-t border-neutral-100 bg-white px-5 py-3">
                  <span className="text-[11px] text-neutral-400">Order ID: {o.id}</span>
                  <Link
                    to={`/order-confirmation/${o.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:text-red-600 transition-colors"
                  >
                    <span>View Receipt &amp; Tracking</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TrustBadgesPreFooter />
    </div>
  );
};
