import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useArtStyle, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single art-style door — /styles/:styleSlug.
 * Cross-world: every universe + garment rendered in this visual language.
 */
export const Style: React.FC = () => {
  const { styleSlug } = useParams<{ styleSlug: string }>();
  const { data: style } = useArtStyle(styleSlug);
  const { data: allProducts } = useProducts();

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      artStyleSlug: (styleSlug ?? 'all') as FilterState['artStyleSlug'],
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, styleSlug]);

  if (style === undefined) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-ink">Unfolding style…</p>
      </div>
    );
  }

  if (!style) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Style not found</h1>
        <p className="text-sm text-ink-muted mt-2">This thread leads nowhere — yet.</p>
        <Link to="/styles" className="inline-block mt-6 text-sm underline underline-offset-4">All styles</Link>
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
            <Link to="/styles" className="hover:underline">Art Styles</Link>
            <span className="mx-2">›</span>
            <span>{style.name}</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            {style.name}
          </h1>
          <p className="font-serif italic text-lg text-ink-muted mt-2">{style.tagline}</p>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">{style.description}</p>
          <p className="text-xs text-ink-muted mt-4 uppercase tracking-widest">
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
};
