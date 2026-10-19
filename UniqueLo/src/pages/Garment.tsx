import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useGarments, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single garment door — /garments/:garmentSlug.
 * Cross-world: every universe + art style that ships this garment.
 */
export const Garment: React.FC = () => {
  const { garmentSlug } = useParams<{ garmentSlug: string }>();
  const { data: garments } = useGarments();
  const { data: allProducts } = useProducts();
  const garment = (garments ?? []).find((g) => g.slug === garmentSlug);

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      garmentTypes: garmentSlug ? [garmentSlug] : [],
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, garmentSlug]);

  if (garments !== undefined && !garment) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Garment not found</h1>
        <p className="text-sm text-ink-muted mt-2">This thread leads nowhere — yet.</p>
        <Link to="/garments" className="inline-block mt-6 text-sm underline underline-offset-4">All garments</Link>
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
            <Link to="/garments" className="hover:underline">Garments</Link>
            <span className="mx-2">›</span>
            <span>{garment?.name ?? '…'}</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            {garment?.name ?? 'Garment'}
          </h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">{garment?.description}</p>
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
