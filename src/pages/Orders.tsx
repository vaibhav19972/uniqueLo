import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import { formatPrice } from '../lib/data';
import { Button } from '../components/ui/Button';

interface OrderRow {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  order_items: { id: string; product_name: string; variant_sku: string; quantity: number; price_cents: number }[];
}

/**
 * Signed-in order history. Reads `orders` + embedded `order_items` under RLS —
 * the policies added in 20261031/20261032 restrict both to `user_id = auth.uid()`.
 * There is deliberately no client-side filtering: if RLS is wrong, this page
 * must show the leak rather than hide it.
 */
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
      <div className="bg-cream min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs uppercase tracking-eyebrow text-ink-muted">Atelier Account</p>
          <h1 className="font-serif text-3xl text-ink mt-2">Sign in to see your orders</h1>
          <p className="text-sm text-ink-muted mt-3 max-w-md mx-auto leading-relaxed">
            Your order history lives with your account. Ordered as a guest? Track it with your order ID and email.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="md" onClick={() => openAuthModal('signin')}>
              Sign in
            </Button>
            <Link to="/track-order">
              <Button variant="secondary" size="md">
                Track a guest order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted">Account</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-1">Order history</h1>

        {orders === null && (
          <div className="mt-10 flex items-center gap-3 text-sm text-ink-muted">
            <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Loading your orders…
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 border border-error/40 bg-error/5 p-4 text-sm text-error">
            Could not load orders: {error}
          </div>
        )}

        {orders && orders.length === 0 && !error && (
          <div className="mt-10 border border-stone bg-paper p-8 text-center">
            <p className="font-serif text-xl text-ink">No orders yet</p>
            <p className="text-sm text-ink-muted mt-2">Pieces you order while signed in will appear here.</p>
            <Link to="/shop" className="inline-block mt-6">
              <Button variant="primary" size="md">
                Shop the collection
              </Button>
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="mt-8 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="border border-stone bg-paper">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-stone">
                  <div>
                    <p className="text-xs uppercase tracking-label text-ink-muted">
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="font-mono text-xs text-ink-muted mt-0.5">{o.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink font-medium">{formatPrice(o.total_cents)}</p>
                    <p className="text-xs uppercase tracking-label text-ink-muted mt-0.5">{o.status}</p>
                  </div>
                </div>

                <ul className="divide-y divide-stone/60">
                  {(o.order_items ?? []).map((item) => (
                    <li key={item.id} className="px-5 py-3 flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-ink min-w-0">
                        {item.product_name}
                        <span className="text-ink-muted text-xs ml-2">{item.variant_sku}</span>
                      </span>
                      <span className="text-ink-muted text-xs shrink-0">
                        ×{item.quantity} · {formatPrice(item.price_cents)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="px-5 py-3 border-t border-stone">
                  <Link
                    to={`/order-confirmation/${o.id}`}
                    className="text-xs uppercase tracking-label text-accent hover:text-accent-hover transition-colors"
                  >
                    View order →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
