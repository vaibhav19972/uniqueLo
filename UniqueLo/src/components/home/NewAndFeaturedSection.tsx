import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { ProductCard } from '../shop/ProductCard';

type FeaturedTab = 'new-arrivals' | 'bestsellers' | 'limited-editions';

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
    slug: 'bestsellers',
    title: 'Bestsellers',
    tagline: 'Most-reordered collector pieces across all worlds.',
  },
  {
    slug: 'limited-editions',
    title: 'Limited Editions',
    tagline: 'Strictly numbered runs with zero mass reproduction.',
  },
];

export const NewAndFeaturedSection: React.FC = () => {
  const { data: allProducts } = useProducts();
  const [activeTab, setActiveTab] = useState<FeaturedTab>('new-arrivals');

  const productsForTab = useMemo(() => {
    const list = allProducts ?? [];
    if (activeTab === 'new-arrivals') {
      // Sort by newest batch or reverse catalog order
      return [...list].reverse().slice(0, 4);
    }
    if (activeTab === 'bestsellers') {
      return list.filter((p) => p.featured || (p.soldCount && parseInt(p.soldCount, 10) > 30)).slice(0, 4);
    }
    if (activeTab === 'limited-editions') {
      return list
        .filter((p) => p.batchNumber != null && p.batchTotal != null)
        .slice(0, 4);
    }
    return list.slice(0, 4);
  }, [allProducts, activeTab]);

  const currentTabConfig = TABS.find((t) => t.slug === activeTab) || TABS[0];

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
          sub="Explore latest atelier drops, community bestsellers, and scarce numbered runs."
          linkTo={`/new-featured/${activeTab}`}
          linkLabel="View all in New & Featured"
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
                  onClick={() => setActiveTab(tab.slug)}
                  className={`px-4 py-2 text-xs uppercase font-sans tracking-widest font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                    isSelected
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-8">
          {productsForTab.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="mt-10 text-center">
          <Link
            to={`/new-featured/${activeTab}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-paper border border-stone/80 hover:border-ink text-ink text-xs uppercase font-sans tracking-widest font-semibold hover:bg-ink hover:text-cream transition-all shadow-sm"
          >
            Explore Complete {currentTabConfig.title} Collection
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
