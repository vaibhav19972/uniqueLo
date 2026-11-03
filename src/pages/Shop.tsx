import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { filterProducts, type ArtStyleSlug, type EditSlug } from '../lib/data';
import { useProducts, useCategories } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';
import { CategoryTabs } from '../components/shop/CategoryTabs';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * The shop's two non-catalogue states — loading and error. They used to be
 * centred around a 48px rounded-full glyph badge over a serif sentence, which
 * is a different system's empty state. Here it is a ruled block at the left
 * margin, the same register as the rest of the page: a label, a sentence, and
 * nothing that looks like an illustration.
 */
function CatalogState({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="mx-auto max-w-[46rem] px-4 py-16 sm:px-6 lg:px-12">
      <div className="border-t border-stone pt-4">
        <p className="loom-label text-ink-muted">The collection</p>
        <h3 className="loom-display mt-2 text-[1.5rem] text-ink">{message}</h3>
        {detail && (
          <p className="mt-2 max-w-[52ch] font-sans text-[13px] leading-relaxed text-ink-muted">
            {detail}
          </p>
        )}
      </div>
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
    // Presence deep-link from Home's Quiet / Balanced / Loud panes. Intensity
    // is the field every product carries, so it is the axis that can always
    // answer the question the pane asked.
    if (intensity) s.setIntensity(intensity as 'quiet' | 'balanced' | 'loud');
    // A technique deep-link from /our-craft/:slug. `toggleTechnique` is the only
    // setter on the store; it flips, so call it only when it would turn on.
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
    <div className="min-h-screen w-full bg-cream">
      {/* The head: what this page is, how many pieces are in it, and the
          filter state — in that order, at one type register. */}
      <section className="border-b border-stone bg-cream pb-6 pt-8">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1
                className="loom-display text-ink"
                style={{ fontSize: 'var(--text-display)' }}
              >
                {currentCategory ? currentCategory.name : 'The Collection'}
              </h1>
              <p className="mt-2 max-w-[54ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                {currentCategory
                  ? currentCategory.description
                  : 'Every piece currently in stock, priced. Filter by world, garment, or how loudly the embroidery reads.'}
              </p>
            </div>

            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{filteredProducts.length}</span>
              {' '}of {(allProducts ?? []).length} shown
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <CategoryTabs />

      {/* Filter Bar with Search & Chips */}
      <FilterBar />

      {/* Main Grid Container */}
      <div className="mx-auto max-w-[var(--container-max)] px-4 pb-24 pt-6 sm:px-6 lg:px-12">
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

      {/* ── Sticky Mobile Filter & Sort Bar (Bonkers 1:1 Architecture) ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 flex h-12 items-stretch border-t border-neutral-300 bg-white/95 backdrop-blur-md shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }}
          className="flex-1 flex items-center justify-center gap-1.5 font-display text-xs font-black uppercase tracking-wider text-black active:bg-neutral-100"
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
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }}
          className="flex-1 flex items-center justify-center gap-1.5 font-display text-xs font-black uppercase tracking-wider text-black active:bg-neutral-100"
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