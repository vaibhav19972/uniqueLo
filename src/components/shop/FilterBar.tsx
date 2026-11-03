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
    setIntensity,
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
    (filters.intensity && filters.intensity !== 'all' ? 1 : 0) +
    (filters.artStyleSlug && filters.artStyleSlug !== 'all' ? 1 : 0) +
    (filters.universeSlug && filters.universeSlug !== 'all' ? 1 : 0) +
    (filters.characterId && filters.characterId !== 'all' ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Top Control Bar: Search + Filter Toggle + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Filter Toggle & Search Bar */}
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="facet-filter-tray"
              className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xs border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 shadow-xs transition hover:border-black active:scale-98"
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
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
                placeholder="Search pieces, fits, motifs..."
                className="min-h-[42px] w-full rounded-xs border border-neutral-300 bg-neutral-50 pl-8 pr-7 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <svg
                className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M16.5 16.5L21 21" />
              </svg>
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Collections axis */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Collections">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Drops
            </span>
            {COLLECTIONS.map((c) => {
              const isActive = (filters.collectionSlug ?? filters.artStyleSlug) === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCollectionSlug(isActive ? 'all' : c.slug)}
                  aria-pressed={isActive}
                  title={c.tagline}
                  className={`min-h-[38px] rounded-xs border px-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                  }`}
                >
                  {c.name.replace(' Collection', '')}
                </button>
              );
            })}
          </div>

          {/* Right Side: Sort Selector */}
          <div className="flex items-center space-x-2 sm:ml-4 sm:justify-end">
            <label htmlFor="sort-select" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Sort
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-[38px] rounded-xs border border-neutral-300 bg-white px-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900 focus:border-black focus:outline-none"
            >
              <option value="newest">Featured &amp; Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-2.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active:
            </span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Query: "{filters.searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search query" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {filters.universeSlug && filters.universeSlug !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                World: {filters.universeSlug}
                <button type="button" onClick={() => setUniverse('all')} aria-label="Clear universe filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {filters.characterId && filters.characterId !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Character: {filters.characterId}
                <button type="button" onClick={() => setCharacter('all')} aria-label="Clear character filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {filters.expressionSlug && filters.expressionSlug !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Style: {filters.expressionSlug.replace(/-/g, ' ')}
                <button type="button" onClick={() => setExpressionSlug('all')} aria-label="Clear style filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {filters.intensity && filters.intensity !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Presence: {filters.intensity}
                <button type="button" onClick={() => setIntensity('all')} aria-label="Clear presence filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {((filters.collectionSlug && filters.collectionSlug !== 'all') || (filters.artStyleSlug && filters.artStyleSlug !== 'all')) && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Collection: {COLLECTIONS.find((c) => c.slug === (filters.collectionSlug || filters.artStyleSlug))?.name.replace(' Collection', '') ?? (filters.collectionSlug || filters.artStyleSlug)}
                <button type="button" onClick={() => setCollectionSlug('all')} aria-label="Clear collection filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            {filters.garmentTypes?.map((g) => (
              <span key={g} className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                {g}
                <button type="button" onClick={() => toggleGarmentType(g)} aria-label={`Remove ${g} filter`} className="text-neutral-500 hover:text-black">✕</button>
              </span>
            ))}

            {filters.techniques?.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                {t}
                <button type="button" onClick={() => toggleTechnique(t)} aria-label={`Remove ${t} filter`} className="text-neutral-500 hover:text-black">✕</button>
              </span>
            ))}

            {filters.sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Size: {s}
                <button type="button" onClick={() => toggleSize(s)} aria-label={`Remove size ${s} filter`} className="text-neutral-500 hover:text-black">✕</button>
              </span>
            ))}

            {filters.priceMax && (
              <span className="inline-flex items-center gap-1 rounded-xs border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                Max: {formatPrice(filters.priceMax)}
                <button type="button" onClick={() => setPriceMax(undefined)} aria-label="Clear price filter" className="text-neutral-500 hover:text-black">✕</button>
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="ml-2 text-xs font-bold uppercase tracking-wider text-red-600 underline underline-offset-4 hover:text-red-700"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Expandable Filter Tray */}
        {isOpen && (
          <div id="facet-filter-tray" className="mt-4 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-5 pb-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 animate-in fade-in duration-200">
            {/* 1. Garment Silhouette */}
            <div>
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900">
                Silhouette
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {GARMENTS.map((g) => {
                  const isSelected = filters.garmentTypes?.includes(g.slug);
                  return (
                    <button
                      key={g.slug}
                      type="button"
                      onClick={() => toggleGarmentType(g.slug)}
                      aria-pressed={!!isSelected}
                      aria-label={`Filter by silhouette ${g.name}`}
                      className={`min-h-[38px] rounded-xs px-2.5 py-1 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
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
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900">
                Presence Style (1–5)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {EXPRESSION_LEVELS.map((exp) => {
                  const isSelected = filters.expressionSlug === exp.slug;
                  return (
                    <button
                      key={exp.slug}
                      type="button"
                      onClick={() => setExpressionSlug(isSelected ? 'all' : exp.slug)}
                      aria-pressed={isSelected}
                      title={exp.tagline}
                      className={`min-h-[38px] rounded-xs px-2.5 py-1 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
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
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900">
                Craft Technique
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {EMBROIDERY_TECHNIQUES.map((tech) => {
                  const isSelected = filters.techniques?.includes(tech.key);
                  return (
                    <button
                      key={tech.key}
                      type="button"
                      onClick={() => toggleTechnique(tech.key)}
                      aria-pressed={!!isSelected}
                      aria-label={`Filter by ${tech.label}`}
                      className={`min-h-[38px] rounded-xs px-2.5 py-1 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
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
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900">
                Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes?.map((s) => {
                  const isSelected = filters.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      aria-label={`Filter by size ${s}`}
                      aria-pressed={isSelected}
                      className={`min-h-[38px] min-w-[38px] rounded-xs px-2 py-1 text-xs font-bold uppercase border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
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
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Max Budget
                </h4>
                <span className="text-xs font-black text-red-600">
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
                className="w-full accent-black cursor-pointer"
                disabled={maxPriceCents === undefined}
              />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
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
