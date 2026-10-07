import React, { useMemo } from 'react';
import { filterProducts } from '../lib/data';
import { useProducts, useCategories } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';
import { CategoryTabs } from '../components/shop/CategoryTabs';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductGrid } from '../components/shop/ProductGrid';

function CatalogState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="py-24 text-center max-w-md mx-auto px-4">
      <div className="w-12 h-12 rounded-full border border-stone mx-auto flex items-center justify-center text-stone text-xl mb-4">
        ✦
      </div>
      <h3 className="font-serif text-2xl text-ink">{message}</h3>
      {detail && (
        <p className="text-xs text-ink-muted mt-2 font-light leading-relaxed">{detail}</p>
      )}
    </div>
  );
}

export const Shop: React.FC = () => {
  const { data: allProducts, isPending, isError, error } = useProducts();
  const { data: categories } = useCategories();
  const filters = useFiltersStore((state) => state.filters);

  const currentCategory = useMemo(() => {
    if (!categories || filters.categorySlug === 'all') return null;
    return categories.find((c) => c.slug === filters.categorySlug);
  }, [categories, filters.categorySlug]);

  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts ?? [], filters);
  }, [allProducts, filters]);

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Header */}
      <section className="pt-12 pb-8 bg-paper border-b border-stone/50 relative overflow-hidden">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                {currentCategory ? `Curated Category • ${currentCategory.label}` : 'Permanent & Capsule Editions'}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
                {currentCategory ? currentCategory.name : 'The Atelier Collections'}
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mt-3 font-light leading-relaxed">
                {currentCategory
                  ? currentCategory.description
                  : 'Every piece is constructed from heirloom natural textiles and enriched with three-dimensional hand needlecraft. Inspect individual stitch reliefs or customize with bespoke monograms.'}
              </p>
            </div>

            {/* Needlework Metrics Badge */}
            <div className="flex items-center gap-4 py-2 px-4 bg-cream border border-stone/80 text-xs text-ink font-sans">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-ink-muted">Available Edits</span>
                <span className="font-serif text-lg font-medium text-ink">{filteredProducts.length} Garments</span>
              </div>
              <div className="h-8 w-px bg-stone/80" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-ink-muted">Needlecraft</span>
                <span className="font-serif text-lg font-medium text-accent">100% Hand-Finished</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <CategoryTabs />

      {/* Filter Bar with Search & Chips */}
      <FilterBar />

      {/* Main Grid Container */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-8">
        {isError ? (
          <CatalogState
            message="The Collection Could Not Be Reached"
            detail={error instanceof Error ? error.message : 'Please try again shortly.'}
          />
        ) : isPending ? (
          <CatalogState message="Curating the Collection..." />
        ) : filteredProducts.length === 0 ? (
          <CatalogState
            message="No Matching Atelier Pieces Found"
            detail="Try loosening your filters or clearing search criteria to reveal additional archival editions."
          />
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </div>
  );
};