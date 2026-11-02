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
    const universe = searchParams.get('universe');
    const character = searchParams.get('character');
    const style = searchParams.get('style');
    const garment = searchParams.get('garment');
    const edit = searchParams.get('edit');
    const expression = searchParams.get('expression');
    const technique = searchParams.get('technique');
    if (universe) s.setUniverse(universe);
    if (character) s.setCharacter(character);
    if (style) s.setArtStyle(style as ArtStyleSlug);
    if (garment) s.setGarmentTypes([garment]);
    if (edit) s.setEdit(edit as EditSlug);
    if (expression) s.setExpressionSlug(expression as any);
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
    </div>
  );
};