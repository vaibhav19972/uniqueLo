import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { filterProducts, type ArtStyleSlug, type EditSlug } from '../lib/data';
import { useProducts, useCategories } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';
import { CategoryTabs } from '../components/shop/CategoryTabs';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductGrid } from '../components/shop/ProductGrid';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

function CatalogState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">{message}</h3>
      {detail && (
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-w-md mx-auto">
          {detail}
        </p>
      )}
    </div>
  );
}

export const Shop: React.FC = () => {
  const { data: allProducts, isPending, isError, error } = useProducts();
  const { data: categories } = useCategories();
  const filters = useFiltersStore((state) => state.filters);
  const [searchParams] = useSearchParams();
  const lastSearchRef = useRef<string | null>(null);

  // Door deep-links: /shop?universe=x&character=y&style=z&garment=w&edit=e
  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (lastSearchRef.current === currentSearch) return;
    lastSearchRef.current = currentSearch;

    const s = useFiltersStore.getState();
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort');
    const universe = searchParams.get('universe');
    const character = searchParams.get('character');
    const style = searchParams.get('style');
    const garment = searchParams.get('garment');
    const edit = searchParams.get('edit');
    const expression = searchParams.get('expression');
    const technique = searchParams.get('technique');
    const intensity = searchParams.get('intensity');

    if (category) s.setCategory(category);
    if (gender && (gender === 'men' || gender === 'women' || gender === 'unisex' || gender === 'all')) {
      s.setGender(gender);
    }
    if (query !== null) s.setSearchQuery(query);
    if (sort) {
      if (sort === 'new' || sort === 'newest') s.setSort('newest');
      else if (sort === 'price-asc') s.setSort('price-asc');
      else if (sort === 'price-desc') s.setSort('price-desc');
    }
    if (universe) s.setUniverse(universe);
    if (character) s.setCharacter(character);
    if (style) s.setArtStyle(style as ArtStyleSlug);
    if (garment) s.setGarmentTypes([garment]);
    if (edit) s.setEdit(edit as EditSlug);
    if (expression) s.setExpressionSlug(expression as any);
    if (intensity) s.setIntensity(intensity as 'quiet' | 'balanced' | 'loud');
    if (technique && !(s.filters.techniques ?? []).includes(technique as any)) {
      s.toggleTechnique(technique as any);
    }
  }, [searchParams]);

  const currentCategory = useMemo(() => {
    if (!categories || filters.categorySlug === 'all') return null;
    return categories.find((c) => c.slug === filters.categorySlug);
  }, [categories, filters.categorySlug]);

  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts ?? [], filters);
  }, [allProducts, filters]);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear PLP Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-8 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">{currentCategory ? currentCategory.name : 'The Collection'}</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>ORIGINAL STREETWEAR ARCHIVE</span>
              </div>
              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {currentCategory ? currentCategory.name : 'The Full Collection'}
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs text-neutral-500 sm:text-sm">
                {currentCategory
                  ? currentCategory.description
                  : 'Every piece in the current drop. Filter by universe narrative, silhouette cut, or needlework density.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                {filteredProducts.length} Pieces
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <CategoryTabs />

      {/* Filter Bar with Search & Chips */}
      <FilterBar />

      {/* Main Grid Container */}
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {isError ? (
          <CatalogState
            message="The Collection Could Not Be Reached"
            detail={error instanceof Error ? error.message : 'Please try again shortly.'}
          />
        ) : isPending ? (
          <CatalogState message="Loading Fresh Drops..." />
        ) : filteredProducts.length === 0 ? (
          <CatalogState
            message="No Matching Pieces Found"
            detail="Try loosening your filters or clearing search criteria to reveal additional archival editions."
          />
        ) : (
          <ProductGrid products={filteredProducts} cardType="quick" />
        )}
      </div>

      {/* Trust Badges Pre-Footer matching Home */}
      <TrustBadgesPreFooter />

      {/* ── Sticky Mobile Filter & Sort Bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 flex h-12 items-stretch border-t border-neutral-300 bg-white/95 backdrop-blur-md shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-black active:bg-neutral-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>FILTER</span>
        </button>

        <div className="w-[1px] bg-neutral-200" />

        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-black active:bg-neutral-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>SORT BY</span>
        </button>
      </div>
    </div>
  );
};
