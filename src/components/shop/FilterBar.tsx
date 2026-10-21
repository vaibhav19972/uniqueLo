import React, { useState } from 'react';
import {
  formatPrice,
  COLLECTIONS,
  EXPRESSION_LEVELS,
  GARMENTS,
  type SortKey,
  type EmbroideryTechnique,
} from '../../lib/data';
import { useAllSizes, useMaxPriceCents } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';

const EMBROIDERY_TECHNIQUES: { key: EmbroideryTechnique; label: string }[] = [
  { key: 'botanical-chain', label: 'Botanical Chain' },
  { key: 'hand-zardozi', label: 'Hand Zardozi' },
  { key: 'kantha-quilt', label: 'Kantha Quilt' },
  { key: 'crewel-needlework', label: 'Crewel Wool' },
  { key: 'satin-stitch', label: 'Satin Stitch' },
  { key: 'sashiko-selvedge', label: 'Sashiko Selvedge' },
  { key: 'french-knot', label: 'French Knot' },
  { key: 'metallic-zari', label: 'Metallic Zari' },
  { key: 'monogram-bespoke', label: 'Bespoke Monogram' },
];

export const FilterBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: sizes } = useAllSizes();
  const { data: maxPriceCents } = useMaxPriceCents();

  const {
    filters,
    setCollectionSlug,
    setUniverse,
    setCharacter,
    setExpressionSlug,
    toggleGarmentType,
    toggleSize,
    toggleTechnique,
    setPriceMax,
    setSearchQuery,
    setSort,
    resetFilters,
  } = useFiltersStore();

  const activeFilterCount =
    filters.sizes.length +
    (filters.techniques?.length || 0) +
    (filters.garmentTypes?.length || 0) +
    (filters.expressionSlug && filters.expressionSlug !== 'all' ? 1 : 0) +
    (filters.artStyleSlug && filters.artStyleSlug !== 'all' ? 1 : 0) +
    (filters.universeSlug && filters.universeSlug !== 'all' ? 1 : 0) +
    (filters.characterId && filters.characterId !== 'all' ? 1 : 0) +
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
              aria-expanded={isOpen}
              aria-controls="facet-filter-tray"
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
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <input
                id="shop-search"
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stitches, coats, flora..."
                className="w-full bg-paper border border-stone/80 pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-warm-gray focus:outline-accent"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M16.5 16.5L21 21" />
              </svg>
              {filters.searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Collections axis: seasonal drops & aesthetic capsules */}
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Collections">
            <span className="text-[10px] uppercase tracking-widest text-ink font-medium sm:mr-4">
              Collections
            </span>
            {COLLECTIONS.map((c) => {
              const isActive = (filters.collectionSlug ?? filters.artStyleSlug) === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => {
                    const next = isActive ? 'all' : c.slug;
                    setCollectionSlug(next);
                  }}
                  aria-pressed={isActive}
                  title={c.tagline}
                  className={`rounded-full px-3.5 py-2 min-h-[44px] text-[11px] uppercase tracking-widest font-sans border transition-colors cursor-pointer ${
                    isActive
                      ? 'border-transparent bg-ink text-cream'
                      : 'border-stone bg-paper text-ink hover:border-ink'
                  }`}
                >
                  {c.name.replace(' Collection', '')}
                </button>
              );
            })}
          </div>

          {/* Right Side: Sort Selector */}
          <div className="mt-3 flex items-center justify-between sm:justify-end space-x-3 sm:mt-0 sm:ml-8">
            <label htmlFor="sort-select" className="text-xs uppercase tracking-widest text-ink hidden sm:inline">
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
                <button onClick={() => setSearchQuery('')} aria-label="Clear search query" className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {filters.universeSlug && filters.universeSlug !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                World: {filters.universeSlug}
                <button onClick={() => setUniverse('all')} aria-label="Clear universe filter" className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {filters.characterId && filters.characterId !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Character: {filters.characterId}
                <button onClick={() => setCharacter('all')} aria-label="Clear character filter" className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {filters.expressionSlug && filters.expressionSlug !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Style: {filters.expressionSlug.replace(/-/g, ' ')}
                <button onClick={() => setExpressionSlug('all')} aria-label="Clear style filter" className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {((filters.collectionSlug && filters.collectionSlug !== 'all') || (filters.artStyleSlug && filters.artStyleSlug !== 'all')) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Collection: {COLLECTIONS.find((c) => c.slug === (filters.collectionSlug || filters.artStyleSlug))?.name.replace(' Collection', '') ?? (filters.collectionSlug || filters.artStyleSlug)}
                <button onClick={() => setCollectionSlug('all')} aria-label="Clear collection filter" className="text-ink-muted hover:text-ink">✕</button>
              </span>
            )}

            {filters.garmentTypes?.map((g) => (
              <span key={g} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                {g}
                <button onClick={() => toggleGarmentType(g)} aria-label={`Remove ${g} filter`} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.techniques?.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                {t}
                <button onClick={() => toggleTechnique(t)} aria-label={`Remove ${t} filter`} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Size: {s}
                <button onClick={() => toggleSize(s)} aria-label={`Remove size ${s} filter`} className="text-ink-muted hover:text-ink">✕</button>
              </span>
            ))}

            {filters.priceMax && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper border border-stone text-[11px] text-ink">
                Max: {formatPrice(filters.priceMax)}
                <button onClick={() => setPriceMax(undefined)} aria-label="Clear price filter" className="text-ink-muted hover:text-ink">✕</button>
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
          <div id="facet-filter-tray" className="pt-6 pb-3 border-t border-stone/50 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 animate-in fade-in duration-200">
            {/* 1. Garment Silhouette */}
            <div>
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink mb-3">
                Garment Silhouette
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {GARMENTS.map((g) => {
                  const isSelected = filters.garmentTypes?.includes(g.slug);
                  return (
                    <button
                      key={g.slug}
                      onClick={() => toggleGarmentType(g.slug)}
                      aria-pressed={!!isSelected}
                      aria-label={`Filter by silhouette ${g.name}`}
                      className={`px-2.5 py-1 min-h-[44px] text-[11px] border transition-colors cursor-pointer capitalize ${
                        isSelected
                          ? 'border-ink bg-ink text-cream font-medium'
                          : 'border-stone bg-paper text-ink hover:border-ink/50'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Style (1-5 Scale) */}
            <div>
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-medium text-ink mb-3">
                Embroidery Style (1–5)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {EXPRESSION_LEVELS.map((exp) => {
                  const isSelected = filters.expressionSlug === exp.slug;
                  return (
                    <button
                      key={exp.slug}
                      onClick={() => setExpressionSlug(isSelected ? 'all' : exp.slug)}
                      aria-pressed={isSelected}
                      title={exp.tagline}
                      className={`px-2.5 py-1 min-h-[44px] text-[11px] border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-ink bg-ink text-cream font-medium'
                          : 'border-stone bg-paper text-ink hover:border-ink/50'
                      }`}
                    >
                      {exp.score}. {exp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Embroidery Technique */}
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
                      aria-pressed={!!isSelected}
                      aria-label={`Filter by ${tech.label}`}
                      className={`px-2.5 py-1 min-h-[44px] text-[11px] border transition-colors cursor-pointer ${
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

            {/* 4. Sizes */}
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
                      aria-label={`Filter by size ${s}`}
                      aria-pressed={isSelected}
                      className={`min-w-[44px] min-h-[44px] w-11 h-11 text-xs border transition-colors cursor-pointer font-sans ${
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

            {/* 5. Price Max Slider & Reset */}
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
                min={150000}
                max={maxPriceCents ?? 600000}
                step={25000}
                value={filters.priceMax || maxPriceCents || 600000}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
                disabled={maxPriceCents === undefined}
              />
              <div className="flex justify-between text-[10px] text-ink-muted mt-1">
                <span>{formatPrice(150000)}</span>
                <span>{maxPriceCents !== undefined ? formatPrice(maxPriceCents) : '…'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
