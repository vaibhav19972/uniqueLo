import React, { useMemo } from 'react';
import { getProducts, filterProducts } from '../lib/data';
import { useFiltersStore } from '../stores/filters';
import { CategoryTabs } from '../components/shop/CategoryTabs';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductGrid } from '../components/shop/ProductGrid';

export const Shop: React.FC = () => {
  const allProducts = useMemo(() => getProducts(), []);
  const filters = useFiltersStore((state) => state.filters);

  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, filters);
  }, [allProducts, filters]);

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Header */}
      <section className="pt-12 pb-8 bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
            Permanent & Capsule Editions
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
            The Atelier Collections
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mt-3 font-light leading-relaxed">
            Every piece is constructed from heirloom natural textiles and enriched with 
            three-dimensional hand needlecraft. Inspect individual stitch reliefs or customize with bespoke monograms.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <CategoryTabs />

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Grid Container */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};
