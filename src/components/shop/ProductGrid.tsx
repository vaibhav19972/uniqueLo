import React from 'react';
import { Link } from 'react-router';
import type { Product } from '../../lib/data';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/Button';
import { useFiltersStore } from '../../stores/filters';

interface ProductGridProps {
  products: Product[];
  cardType?: 'quick' | 'normal';
}

/**
 * THE INDEX
 *
 * A PLP is a list, so it is built as one. The previous grid injected two
 * full-width "craft provenance" interludes at fixed positions — an editorial
 * device that broke the grid at index 3 and 7 regardless of how many products
 * were there, which meant a filtered result of five items got an interlude
 * about Zardozi in the middle of it. Interludes belong to a curated page, not
 * to a filtered one.
 *
 * What replaces them is the information a filtering buyer actually needs and
 * cannot currently see: how many pieces match, and how to widen the search
 * when nothing does.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({ products, cardType = 'quick' }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h3 className="loom-display text-2xl text-ink">Nothing matches those filters</h3>
        <p className="mx-auto mt-2 max-w-[42ch] font-sans text-sm leading-relaxed text-ink-muted">
          The catalogue is small by design, so a narrow combination can empty it.
          Clearing the filters shows everything currently in stock.
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-6"
          onClick={resetFilters}
        >
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-stone pb-3">
        <p className="loom-label text-ink-muted">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
        <Link
          to="/our-craft"
          className="font-sans text-[12px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:text-ink"
        >
          What the prices pay for
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} type={cardType} />
        ))}
      </div>
    </div>
  );
};
