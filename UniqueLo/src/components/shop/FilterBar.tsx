import React, { useState } from 'react';
import {
  formatPrice,
  type SortKey,
  type EmbroideryTechnique,
} from '../../lib/data';
import { useAllColors, useAllSizes, useMaxPriceCents } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';

const EMBROIDERY_TECHNIQUES: { key: EmbroideryTechnique; label: string }[] = [
  { key: 'botanical-chain', label: 'Botanical Chain' },
  { key: 'hand-zardozi', label: 'Hand Zardozi' },
  { key: 'kantha-quilt', label: 'Kantha Quilt' },
  { key: 'crewel-needlework', label: 'Crewel Wool' },
  { key: 'satin-stitch', label: 'Satin Stitch' },
  { key: 'french-knot', label: 'French Knot' },
  { key: 'metallic-zari', label: 'Metallic Zari' },
  { key: 'monogram-bespoke', label: 'Bespoke Monogram' },
];

export const FilterBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: colors } = useAllColors();
  const { data: sizes } = useAllSizes();
  const { data: maxPriceCents } = useMaxPriceCents();

  const {
    filters,
    toggleColor,
    toggleSize,
    toggleTechnique,
    setPriceMax,
    setSearchQuery,
    setSort,
    resetFilters,
  } = useFiltersStore();

  const activeFilterCount =
    filters.colors.length +
    filters.sizes.length +
    (filters.techniques?.length || 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="w-full bg-cream border-b border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-3.5">
        
        {/* Top Control Bar: Search + Filter Toggle + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Filter Toggle & Search Bar */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center space-x-2 text-xs font-sans tracking-[0.2em] uppercase font-medium text-ink hover:text-accent transition-colors cursor-pointer"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
              </svg>
              <span>Facet Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-paper text-[10px] inline-flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Instant Search Box */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stitches, coats, flora..."
                className="w-full bg-paper border border-stone/80 pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-warm-gray focus:outline-accent"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone text-xs">
                🔍
              </span>
              {filters.searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Sort Selector */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            <label htmlFor="sort-select" className="text-xs uppercase tracking-widest text-ink-muted hidden sm:inline">
              Sort By:
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-paper border border-stone px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent uppercase tracking-wider cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-stone/40 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-ink-muted font-medium mr-1">
              Active:
            </span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Query: "{filters.searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {filters.techniques?.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                {t}
                <button onClick={() => toggleTechnique(t)} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.colors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Color: {c}
                <button onClick={() => toggleColor(c)} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Size: {s}
                <button onClick={() => toggleSize(s)} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.priceMax && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Max: {formatPrice(filters.priceMax)}
                <button onClick={() => setPriceMax(undefined)} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-[11px] uppercase tracking-widest text-accent hover:underline font-medium ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Expandable Filter Tray */}
        {isOpen && (
          <div className="pt-6 pb-3 border-t border-stone/50 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-200">
            {/* 1. Embroidery Technique */}
            <div>
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink mb-3">
                Needlecraft Technique
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {EMBROIDERY_TECHNIQUES.map((tech) => {
                  const isSelected = filters.techniques?.includes(tech.key);
                  return (
                    <button
                      key={tech.key}
                      onClick={() => toggleTechnique(tech.key)}
                      className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-ink bg-ink text-cream'
                          : 'border-stone bg-paper text-ink hover:border-ink/50'
                      }`}
                    >
                      {tech.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Swatches */}
            <div>
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink mb-3">
                Color Palette
              </h4>
              <div className="flex flex-wrap gap-2">
                {colors?.map((c) => {
                  const isSelected = filters.colors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleColor(c.name)}
                      title={c.name}
                      className={`relative w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-accent scale-110 border-transparent'
                          : 'border-stone hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-paper font-bold drop-shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sizes */}
            <div>
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink mb-3">
                Garment Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes?.map((s) => {
                  const isSelected = filters.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`w-9 h-8 text-xs border transition-colors cursor-pointer font-sans ${
                        isSelected
                          ? 'border-ink bg-ink text-cream'
                          : 'border-stone bg-paper text-ink hover:border-ink/50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Price Max Slider & Reset */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink">
                  Price Limit
                </h4>
                <span className="text-xs font-sans font-medium text-ink">
                  {filters.priceMax ? formatPrice(filters.priceMax) : 'All Prices'}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={maxPriceCents ?? 15000}
                step={2500}
                value={filters.priceMax || maxPriceCents || 15000}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
                disabled={maxPriceCents === undefined}
              />
              <div className="flex justify-between text-[10px] text-ink-muted mt-1">
                <span>$150.00</span>
                <span>{maxPriceCents !== undefined ? formatPrice(maxPriceCents) : '…'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
