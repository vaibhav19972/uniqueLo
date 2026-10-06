import React from 'react';
import type { Product } from '../../lib/data';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/Button';
import { useFiltersStore } from '../../stores/filters';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  if (products.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 rounded-full border border-stone mx-auto flex items-center justify-center text-stone text-xl mb-4">
          ✦
        </div>
        <h3 className="font-serif text-2xl text-ink">No Silhouettes Matched</h3>
        <p className="text-xs text-ink-muted mt-2 font-light leading-relaxed">
          No items match your active technique, size, or color filters. 
          Try resetting filters to explore the complete atelier catalogue.
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-6 tracking-widest text-xs"
          onClick={resetFilters}
        >
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Result Metrics */}
      <div className="flex justify-between items-center mb-6 text-xs text-ink-muted uppercase tracking-widest font-mono">
        <span>Showing {products.length} Garments</span>
        <span>Atelier Edition 2026</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};
