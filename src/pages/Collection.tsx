import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useCollection, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Collection: React.FC = () => {
  const { collectionSlug, styleSlug } = useParams<{ collectionSlug?: string; styleSlug?: string }>();
  const activeSlug = collectionSlug || styleSlug;
  const { data: collection } = useCollection(activeSlug);
  const { data: allProducts } = useProducts();

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      collectionSlug: (activeSlug ?? 'all') as FilterState['collectionSlug'],
      artStyleSlug: (activeSlug ?? 'all') as FilterState['artStyleSlug'],
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, activeSlug]);

  if (collection === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white py-16 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-800 animate-pulse">
          Unfolding collection drop…
        </p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Collection Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">This collection thread leads nowhere yet.</p>
        <Link to="/collections" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Collection Drop Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-black transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-black">{collection.name}</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-xs bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  LIMITED DROP
                </span>
                {collection.universeSlug && (
                  <span className="rounded-xs bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                    {collection.universeSlug} CAPSULE
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {collection.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base font-bold text-neutral-600">
                {collection.tagline}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl">
                {collection.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {filtered.length} Pieces
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={filtered} cardType="quick" />
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
