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

      {/* Grid with Editorial Interludes (Task S4.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {products.map((product, index) => {
          const showInterludeOne = index === 3;
          const showInterludeTwo = index === 7;

          return (
            <React.Fragment key={product.slug}>
              <ProductCard product={product} />

              {/* Craft Interlude 1: Lucknow Chikankari / Botanical Chain */}
              {showInterludeOne && (
                <div className="col-span-full my-4 p-8 sm:p-10 bg-parchment border border-dashed border-stone/80 relative overflow-hidden">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.25em] text-accent font-medium">
                        <span>01 // Craft Provenance</span>
                        <span>•</span>
                        <span>Lucknow, Uttar Pradesh</span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
                        32 Stitches. Zero Machines. Unbleached Natural Muslin.
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
                        Chikankari is India's most delicate shadow-work tradition. Every stitch is calibrated by hand 
                        over organic cotton, creating subtle three-dimensional relief that printed fast-fashion can never replicate.
                      </p>
                      <div className="pt-1">
                        <a
                          href="/atelier/botanical-chain"
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-ink hover:text-accent transition-colors"
                        >
                          <span>Explore Chikankari Atelier</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs border-l border-stone/60 pl-6 w-full md:w-auto">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block">Artisan Guild</span>
                        <span className="font-medium text-ink">Old City Collective</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block">Needle Pace</span>
                        <span className="font-medium text-ink">14–20 Hours / Piece</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block">Yarn Core</span>
                        <span className="font-medium text-ink">Mulberry Silk Floss</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-ink-muted block">Stabilizer</span>
                        <span className="font-medium text-ink">Zero Synthetic Backing</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Craft Interlude 2: Jaipur Zardozi Guild */}
              {showInterludeTwo && (
                <div className="col-span-full my-4 p-8 sm:p-10 bg-ink text-cream border border-stone/30 relative overflow-hidden">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.25em] text-accent font-medium">
                        <span>02 // Craft Provenance</span>
                        <span>•</span>
                        <span>Jaipur & Agra Guilds</span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-cream leading-tight">
                        24K Bullion Metallic Wirework on Heavyweight Outerwear.
                      </h3>
                      <p className="text-xs sm:text-sm text-stone/80 font-light leading-relaxed">
                        Hand-anchored gold and metallic French coils engineered for daily chore jackets and overshirts. 
                        Designed to catch ambient light and develop authentic character over decades of wear.
                      </p>
                      <div className="pt-1">
                        <a
                          href="/atelier/zardozi"
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-cream hover:text-accent transition-colors"
                        >
                          <span>Inspect Zardozi Process</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs border-l border-stone/30 pl-6 w-full md:w-auto text-cream">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone/60 block">Artisan Guild</span>
                        <span className="font-medium text-cream">Pink City Bullion Guild</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone/60 block">Needle Pace</span>
                        <span className="font-medium text-cream">28–34 Hours / Piece</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone/60 block">Wirework</span>
                        <span className="font-medium text-cream">24K Bullion Metallic Zari</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone/60 block">Base Cloth</span>
                        <span className="font-medium text-cream">450 GSM Heavy Melton Wool</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
