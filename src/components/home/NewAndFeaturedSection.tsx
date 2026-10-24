import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useCollections } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { ProductCard } from '../shop/ProductCard';

type FeaturedTab = 'new-arrivals' | 'limited-editions' | 'collections';

interface TabConfig {
  slug: FeaturedTab;
  title: string;
  tagline: string;
}

const TABS: TabConfig[] = [
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    tagline: 'Latest embroidery releases freshly completed on atelier looms.',
  },
  {
    slug: 'limited-editions',
    title: 'Limited Editions',
    tagline: 'Strictly numbered runs with zero mass reproduction.',
  },
  {
    slug: 'collections',
    title: 'Collections',
    tagline: 'Seasonal capsule drops & unified embroidery aesthetics across worlds.',
  },
];

export const NewAndFeaturedSection: React.FC = () => {
  const { data: allProducts } = useProducts();
  const { data: collections } = useCollections();
  const [activeTab, setActiveTab] = useState<FeaturedTab>('new-arrivals');
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string>('all');

  const productsForTab = useMemo(() => {
    const list = allProducts ?? [];
    if (activeTab === 'new-arrivals') {
      // Sort by newest createdAt timestamp descending, fallback to original order
      return [...list]
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (b.createdAt) return 1;
          if (a.createdAt) return -1;
          return 0;
        })
        .slice(0, 4);
    }
    if (activeTab === 'limited-editions') {
      // A "limited edition" signal now comes from curation (collector edits,
      // handcrafted pieces), not from a fabricated batch counter.
      return list
        .filter((p) => p.edits?.includes('collector') || p.handcrafted)
        .slice(0, 4);
    }
    if (activeTab === 'collections') {
      if (selectedCollectionSlug !== 'all') {
        return list.filter((p) => p.collectionSlug === selectedCollectionSlug).slice(0, 4);
      }
      return list.filter((p) => Boolean(p.collectionSlug)).slice(0, 4);
    }
    return list.slice(0, 4);
  }, [allProducts, activeTab, selectedCollectionSlug]);

  const currentTabConfig = TABS.find((t) => t.slug === activeTab) || TABS[0];

  const headerLinkTo = activeTab === 'collections' ? '/collections' : `/new-featured/${activeTab}`;
  const headerLinkLabel = activeTab === 'collections' ? 'View all collections' : 'View all in New & Featured';

  const bottomCtaTo =
    activeTab === 'collections'
      ? selectedCollectionSlug !== 'all'
        ? `/collections/${selectedCollectionSlug}`
        : '/collections'
      : `/new-featured/${activeTab}`;

  const selectedColObj = collections?.find((c) => c.slug === selectedCollectionSlug);
  const bottomCtaLabel =
    activeTab === 'collections'
      ? selectedCollectionSlug !== 'all'
        ? `Explore Full ${selectedColObj?.name || 'Collection'}`
        : 'Explore Complete Capsule Collections'
      : `Explore Complete ${currentTabConfig.title} Collection`;

  return (
    <section
      aria-labelledby="new-featured-heading"
      className="bg-cream py-16 lg:py-24 border-b border-stone/50 overflow-hidden"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Curated Drops & Editions"
          title="New & Featured"
          titleId="new-featured-heading"
          sub="Explore latest atelier drops, scarce numbered runs, and thematic capsule collections."
          linkTo={headerLinkTo}
          linkLabel={headerLinkLabel}
        />

        {/* Tab Controls */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone/40">
          <div
            role="tablist"
            aria-label="Filter products by feature tier"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveTab(tab.slug);
                    if (tab.slug === 'collections') {
                      setSelectedCollectionSlug('all');
                    }
                  }}
                  className={`px-4 py-2 text-xs uppercase font-sans tracking-widest font-semibold transition-all border cursor-pointer whitespace-nowrap ${isSelected
                      ? 'bg-ink text-cream border-ink shadow-sm'
                      : 'bg-paper text-ink border-stone/60 hover:border-accent hover:text-accent'
                    }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          <p className="font-serif italic text-xs sm:text-sm text-ink-muted">
            {currentTabConfig.tagline}
          </p>
        </div>

        {/* Collections Dropdown Pills (when Collections tab is active) */}
        {activeTab === 'collections' && (
          <div className="mt-5 p-3.5 sm:p-4 bg-paper border border-stone/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-medium mr-1">
                Capsule Drops:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCollectionSlug('all')}
                className={`px-3 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors border cursor-pointer ${selectedCollectionSlug === 'all'
                    ? 'bg-ink text-cream border-ink font-semibold'
                    : 'bg-cream text-ink border-stone/60 hover:border-ink'
                  }`}
              >
                All Drops
              </button>
              {(collections ?? []).map((col) => {
                const isColActive = selectedCollectionSlug === col.slug;
                return (
                  <button
                    key={col.slug}
                    type="button"
                    onClick={() => setSelectedCollectionSlug(col.slug)}
                    className={`px-3 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors border cursor-pointer ${isColActive
                        ? 'bg-accent text-paper border-accent font-semibold shadow-xs'
                        : 'bg-cream text-ink border-stone/60 hover:border-accent hover:text-accent'
                      }`}
                  >
                    {col.name}
                  </button>
                );
              })}
            </div>
            <Link
              to="/collections"
              className="text-xs font-serif text-accent hover:text-ink transition-colors inline-flex items-center gap-1 font-medium"
            >
              All Drops Showroom →
            </Link>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 mt-6 sm:mt-8">
          {productsForTab.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="mt-10 text-center">
          <Link
            to={bottomCtaTo}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-paper border border-stone/80 hover:border-ink text-ink text-xs uppercase font-sans tracking-widest font-semibold hover:bg-ink hover:text-cream transition-all shadow-sm"
          >
            {bottomCtaLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
