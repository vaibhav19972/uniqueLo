import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useCollection, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single Collection Door — /collections/:collectionSlug.
 * Cross-category: every garment silhouette rendered in this collection drop.
 */
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
      <div className="py-24 text-center min-h-[50vh] flex items-center justify-center bg-cream">
        <p className="font-serif text-2xl text-ink animate-pulse">Unfolding collection drop…</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 min-h-[50vh] flex flex-col items-center justify-center bg-cream">
        <h1 className="font-serif text-3xl text-ink">Collection Not Found</h1>
        <p className="text-sm text-ink-muted mt-2">This collection thread leads nowhere — yet.</p>
        <Link to="/collections" className="inline-block mt-6 text-sm underline underline-offset-4">
          All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/collections" className="hover:underline">Collections</Link>
            <span className="mx-2">›</span>
            <span className="text-accent">{collection.name}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink tracking-tight">
              {collection.name}
            </h1>
            {collection.universeSlug && (
              <span className="text-[11px] uppercase tracking-widest bg-gold/10 text-gold-deep border border-gold/25 px-2.5 py-1">
                {collection.universeSlug}
              </span>
            )}
          </div>
          <p className="font-serif italic text-lg text-ink-muted mt-2">{collection.tagline}</p>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
            {collection.description}
          </p>
          <p className="text-xs text-ink-muted mt-4 uppercase tracking-widest font-mono">
            {filtered.length} piece{filtered.length === 1 ? '' : 's'} in release
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-8">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
};
