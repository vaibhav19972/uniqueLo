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
      title: `Bundle Added (${added} pieces)`,
      description: `Complete ${universeName} capsule look added to bag.`,
      type: 'success',
    });
  };

  return (
    <section
      aria-label="Complete the look"
      className="mt-12 bg-neutral-50 border-t border-neutral-200 text-neutral-900 py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-xs bg-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
              <span>✦</span>
              <span>CURATED OUTFIT BUNDLE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
              Complete the {universeName} Look
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Coordinated streetwear silhouettes styled to be worn together.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4 hover:text-red-600 transition-colors"
          >
            Shop All Pieces →
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-6">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bundle.map((p, i) => (
              <div key={p.slug} className="relative">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-white border border-neutral-200 text-xs font-black shadow-xs"
                  >
                    +
                  </span>
                )}
                <Link
                  to={`/product/${p.slug}`}
                  className="group block bg-white border border-neutral-200/80 p-2.5 rounded-md hover:border-black hover:shadow-md transition-all h-full"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xs bg-neutral-100">
                    <img
                      src={p.images[0]?.src || '/images/placeholders/hoodie.jpg'}
                      alt={p.images[0]?.alt || p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-tight text-neutral-900 mt-2 truncate group-hover:text-red-600 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs font-black text-[#D32F2F] mt-0.5">
                    {formatPrice(getDefaultVariant(p).priceCents)}
                  </p>
                </Link>
              </div>
            ))}
          </div>

          <div className="lg:w-64 shrink-0 rounded-md border border-neutral-200 bg-white p-5 flex flex-col justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Bundle Price</p>
              <p className="font-display text-2xl font-black text-neutral-900 mt-1">
                {formatPrice(setTotal)}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Includes all {bundle.length} coordinating pieces
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddAll}
              className="mt-4 w-full min-h-[44px] rounded-xs bg-black py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              Add Full Look to Bag →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
