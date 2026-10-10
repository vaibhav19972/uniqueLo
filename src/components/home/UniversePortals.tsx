import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useUniverses, useProducts } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 03: Worlds to Wear — universe portal cards (chatgpt-v2).
 * Cards, counts, and links all derive from universes + catalog data; the
 * featured card is keyed by slug (heroverse, per the render), never by index.
 * Card anatomy (render): editorial stack at TOP (serif name in the universe's
 * portal_title_color → caps tagline → hairline divider → lore body), count +
 * gold "Enter →" CTA anchored bottom-left. Side cards are borderless at rest.
 * Text polarity (white-on-dark vs dark-on-light) activates with real artwork
 * at P5; current placeholder assets render with a mild cream wash.
 */
export const UniversePortals: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      c[p.universeSlug] = (c[p.universeSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  return (
    <section aria-labelledby="universes-heading" className="relative overflow-hidden bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Universes"
          title="Worlds to Wear"
          titleId="universes-heading"
          sub="Stories, characters and legacies — embroidered for your everyday."
          linkTo="/shop"
          linkLabel="Explore all universes"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 md:items-center">
          {(universes ?? []).map((u) => {
            const featured = u.slug === 'heroverse';
            return (
              <article
                key={u.slug}
                className={`group relative overflow-hidden rounded-[20px] bg-stone/30 transition-transform duration-500 hover:-translate-y-1 ${
                  featured
                    ? 'z-10 md:scale-[1.03] md:-translate-y-2 md:rotate-[-1.5deg] shadow-float ring-2 ring-gold hover:scale-[1.03]'
                    : ''
                }`}
              >
                {/* Full-bleed media + mild wash (polarity activates with P5 artwork) */}
                <div className="absolute inset-0">
                  {u.emblem_src && (
                    <img
                      src={u.emblem_src}
                      alt={`${u.name} universe artwork`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-cream/55 via-cream/10 to-cream/50" />
                </div>

                {/* Editorial stack at top, count + CTA anchored bottom-left */}
                <div className="relative z-10 flex h-full flex-col p-6 min-h-[430px]">
                  <div className="max-w-[92%]">
                    <h3
                      className="font-serif text-3xl md:text-[38px] leading-[1.05]"
                      style={u.portal_title_color ? { color: u.portal_title_color } : undefined}
                    >
                      {u.name}
                    </h3>
                    <p className="font-sans text-[11px] uppercase tracking-label text-ink-muted mt-2">
                      {u.tagline}
                    </p>
                    <span aria-hidden="true" className="mt-3.5 block h-px w-8 bg-ink/25" />
                    <p className="font-serif text-[15px] text-ink/85 mt-3.5 leading-relaxed line-clamp-3">
                      {u.lore}
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <p className="leading-none">
                      <span className="font-serif font-semibold text-2xl">{counts[u.slug] ?? 0}+ </span>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-ink-muted ml-1">
                        Styles
                      </span>
                    </p>
                    <Link
                      to={`/universes/${u.slug}`}
                      className="mt-3.5 inline-flex w-fit items-center gap-2 rounded-md px-8 py-3 font-serif text-[17px] text-cream bg-gold hover:bg-gold-hover min-h-[44px] transition-colors"
                      aria-label={`Enter ${u.name}`}
                    >
                      Enter {u.name} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};