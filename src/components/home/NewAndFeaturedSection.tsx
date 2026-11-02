import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useCollections } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { ProductCard } from '../shop/ProductCard';
import { useReveal } from '../../hooks/useReveal';
import { hasLicensedMark } from '../../lib/licensed-marks';

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
    // The catalogue carries no edition number and no batch count, so this tab
    // is a curation (collector-edited and handcrafted pieces), not a numbered
    // run. The old tagline — "strictly numbered runs with zero mass
    // reproduction" — promised a fact no table holds.
    tagline: 'Collector-edited and handcrafted pieces, grouped by what they are.',
  },
  {
    slug: 'collections',
    title: 'Collections',
    tagline: 'Seasonal capsule drops & unified embroidery aesthetics across worlds.',
  },
];

export const NewAndFeaturedSection: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: allProducts } = useProducts();
  const { data: collections } = useCollections();
  const [activeTab, setActiveTab] = useState<FeaturedTab>('new-arrivals');
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string>('all');

  const productsForTab = useMemo(() => {
    // A curated rail presents pieces as the brand's own work, so a product whose
    // photograph carries a third-party mark is excluded here (see
    // lib/licensed-marks.ts). The piece stays in the collection and in search.
    const list = (allProducts ?? []).filter((p) => !hasLicensedMark(p));
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
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="new-featured-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="New & Featured"
          titleId="new-featured-heading"
          sub="The latest releases, with their prices. No enquiry forms, no made-to-order waits."
          linkTo={headerLinkTo}
          linkLabel={headerLinkLabel}
        />

        {/* Tab Controls — segmented, square, one row. */}
        <div className="mt-6 flex flex-col gap-3">
          <div
            role="tablist"
            aria-label="Filter products by feature tier"
            className="-mx-4 flex items-center gap-0 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
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
                  className={`min-h-[44px] whitespace-nowrap border border-r-0 border-stone px-4 font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition-colors last:border-r ${
                    isSelected
                      ? 'bg-ink text-cream'
                      : 'bg-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          <p className="font-sans text-[13px] text-ink-muted">{currentTabConfig.tagline}</p>
        </div>

        {/* Collections (when the Collections tab is active) */}
        {activeTab === 'collections' && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCollectionSlug('all')}
              className={`min-h-[44px] border px-3 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                selectedCollectionSlug === 'all'
                  ? 'border-ink bg-ink text-cream'
                  : 'border-stone text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              All drops
            </button>
            {(collections ?? []).map((col) => {
              const isColActive = selectedCollectionSlug === col.slug;
              return (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => setSelectedCollectionSlug(col.slug)}
                  className={`min-h-[44px] border px-3 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    isColActive
                      ? 'border-ink bg-ink text-cream'
                      : 'border-stone text-ink-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  {col.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Grid */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {productsForTab.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="mt-12">
          <Link
            to={bottomCtaTo}
            className="inline-flex min-h-[48px] items-center gap-2 border border-stone-strong px-6 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
          >
            {bottomCtaLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
