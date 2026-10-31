import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { useProducts } from '../hooks/useCatalog';
import { matchesGender, type Gender } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * First-class Men / Women landings over the shared grid.
 * `unisex` products appear under both (see matchesGender).
 */
export const GenderPage: React.FC = () => {
  const location = useLocation();
  const gender: Gender = location.pathname.startsWith('/women') ? 'women' : 'men';
  const { data: allProducts } = useProducts();

  const products = useMemo(
    () => (allProducts ?? []).filter((p) => matchesGender(p, gender)),
    [allProducts, gender],
  );

  const title = gender === 'women' ? 'Women' : 'Men';
  const copy =
    gender === 'women'
      ? 'Embroidered universes, cut for her — plus every unisex piece in the atelier.'
      : 'Embroidered universes, cut for him — plus every unisex piece in the atelier.';

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-eyebrow text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>{title}</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">{title}</h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">{copy}</p>
          <p className="text-xs text-ink-muted mt-4 uppercase tracking-widest">
            {products.length} product{products.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        <ProductGrid products={products} />
      </div>
    </div>
  );
};
