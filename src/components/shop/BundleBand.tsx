import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { formatPrice, getDefaultVariant, type Product } from '../../lib/data';
import { useProducts } from '../../hooks/useCatalog';
import { useCartStore } from '../../stores/cart';
import { useToastStore } from '../../stores/toast';

function pickBundle(products: Product[]): Product[] {
  const inStock = products.filter((p) =>
    p.variants.some((v) => v.status !== 'out-of-stock'),
  );
  if (inStock.length < 2) return [];
  const hero = inStock.find((p) => p.featured) ?? inStock[0];
  const companions = inStock.filter(
    (p) => p.slug !== hero.slug && p.garmentType !== hero.garmentType,
  );
  const picked = [hero, ...companions].slice(0, 4);
  return picked.length >= 2 ? picked : [];
}

/**
 * Render-08 "Complete the Look": curated same-universe set with one Add-All.
 * Shows honest set total at unit prices; a bundle-discount engine is P-future.
 * Renders nothing when fewer than 2 items qualify.
 * Must live inside a [data-universe] wrapper for themed tokens.
 */
export const BundleBand: React.FC<{ universeSlug: string; universeName: string }> = ({
  universeSlug,
  universeName,
}) => {
  const { data: allProducts } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  const bundle = useMemo(() => {
    const inUniverse = (allProducts ?? []).filter((p) => p.universeSlug === universeSlug);
    return pickBundle(inUniverse);
  }, [allProducts, universeSlug]);

  const setTotal = useMemo(() => {
    return bundle.reduce((acc, p) => acc + getDefaultVariant(p).priceCents, 0);
  }, [bundle]);

  if (bundle.length < 2) return null;

  const handleAddAll = () => {
    let added = 0;
    for (const p of bundle) {
      const v = getDefaultVariant(p);
      if (v.status === 'out-of-stock') continue;
      addItem(p.slug, v.sku, 1, undefined, v.quantity ?? 99);
      added += 1;
    }
    showToast({
      title: `Bundle added (${added} pieces)`,
      description: `Complete the ${universeName} look — ${added} pieces at unit prices.`,
      type: 'success',
    });
  };

  return (
    <section
      aria-label="Complete the look"
      className="mt-8 bg-paper border-t border-stone/60 text-ink"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink">Complete the Look</h2>
            <p className="text-sm mt-1 text-ink-muted font-light">Curated pieces from {universeName} that go together.</p>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 text-sm border-b border-ink/40 pb-1 text-ink-muted hover:text-ink hover:border-ink transition-colors">
            Shop the set <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-7">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bundle.map((p, i) => (
              <div key={p.slug} className="relative">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -translate-y-1/2 -left-3.5 z-10 font-serif text-xl text-ink-muted"
                  >
                    +
                  </span>
                )}
                <Link to={`/product/${p.slug}`} className="group block bg-cream/50 border border-stone/70 p-2.5 rounded-sm hover:border-ink transition-colors">
                  <div className="aspect-square overflow-hidden bg-stone/20">
                    <img
                      src={p.images[0]?.src}
                      alt={p.images[0]?.alt || p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-serif text-sm mt-2.5 leading-tight text-ink group-hover:text-accent transition-colors">{p.name}</p>
                  <p className="text-sm text-ink-muted mt-1">{formatPrice(getDefaultVariant(p).priceCents)}</p>
                </Link>
              </div>
            ))}
          </div>

          <div className="lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-stone/60 pt-5 lg:pt-0 lg:pl-6 flex lg:flex-col justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted">Set Total</p>
              <p className="font-serif text-3xl mt-1 text-ink font-medium">
                {formatPrice(setTotal)}
              </p>
              <p className="text-xs mt-1 text-ink-muted">Unit prices · bundle discount engine lands next</p>
            </div>
            <button
              onClick={handleAddAll}
              className="px-6 py-3.5 font-serif text-base min-h-[48px] bg-panel-raised text-white hover:bg-panel-raised/90 transition-colors rounded-sm cursor-pointer"
            >
              Add All to Cart <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
