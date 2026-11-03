import React from 'react';
import { Link } from 'react-router';
import type { Product } from '../../lib/data';
import { ProductCard } from './ProductCard';
import { useFiltersStore } from '../../stores/filters';

interface ProductGridProps {
  products: Product[];
  cardType?: 'quick' | 'normal';
}

/**
 * THE PRODUCT GRID
 * High-performing 2-column mobile / 3-to-4 column desktop responsive product grid.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({ products, cardType = 'quick' }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">
          Nothing matches those filters
        </h3>
        <p className="mx-auto mt-2 max-w-[42ch] text-xs text-neutral-500 leading-relaxed">
          The curated drop is tight by design. Clear filters to reveal everything currently crafted and in stock.
        </p>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-800 transition"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-700">
          Showing <span className="text-black font-black">{products.length}</span> {products.length === 1 ? 'Piece' : 'Pieces'}
        </p>
        <Link
          to="/our-craft"
          className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
        >
          Artisan Needlecraft Standards →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} type={cardType} />
        ))}
      </div>
    </div>
  );
};
