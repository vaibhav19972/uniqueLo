import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useUniverses, useProducts } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 03: Worlds to Wear — universe portal cards (chatgpt-v2).
 * Cards, counts, and links all derive from universes + catalog data.
 *
 * Focus behavior (spotlight / "focus cylinder"): no card is permanently
 * featured. The focused card is whichever the visitor is hovering / keyboard-
 * focusing right now; siblings dim down. At rest all three sit equal.
 *
 * Each universe gets its OWN goofy asymmetric focus personality instead of
 * the old identical lift:
 *  - Animeverse → torii lean: tips left (-2deg), sakura-red ring + petal glow.
 *  - Heroverse  → heroic burst: tips right (+1.5deg), bigger pop + gold glow.
 *  - Itihaas    → darbar sway: gentle left sway, slow settle, bronze arch glow.
 */
const FOCUS: Record<
  string,
  {
    active: string;
    img: string;
    sticker: string;
    stickerLabel: string;
  }
> = {
  animeverse: {
    // tips left like a torii in wind, sakura-red energy
    active:
      'z-10 -translate-y-2 scale-[1.04] -rotate-2 shadow-[0_30px_80px_rgba(122,31,35,0.38)] ring-2 ring-[#7a1f23] duration-500 ease-out',
    img: 'scale-[1.08] -rotate-1',
    sticker: '-rotate-6 bg-[#7a1f23] text-[#f7f5f0]',
    stickerLabel: 'Sakura drop 桜',
  },
  heroverse: {
    // heroic pop: bigger, bouncier, tips right like a waving banner
    active:
      'z-10 -translate-y-3 scale-[1.06] rotate-[1.5deg] shadow-[0_34px_95px_rgba(194,168,120,0.45)] ring-2 ring-gold duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    img: 'scale-110 rotate-1',
    sticker: 'rotate-3 bg-[#c0392b] text-[#d4af37]',
    stickerLabel: 'New issue ★ POW',
  },
  itihaas: {
    // royal sway: slow, heavy, settles like draped silk
    active:
      'z-10 -translate-y-2 scale-[1.03] rotate-[-1deg] skew-x-[-1deg] shadow-[0_30px_85px_rgba(93,58,26,0.45)] ring-2 ring-[#5d3a1a] duration-700 ease-in-out',
    img: 'scale-105 -rotate-[0.5deg]',
    sticker: '-rotate-3 bg-[#5d3a1a] text-[#f6efe3]',
    stickerLabel: 'Darbar festive ॥',
  },
};

export const UniversePortals: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  // Which card holds the spotlight right now (hover / keyboard focus).
  const [active, setActive] = useState<string | null>(null);

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

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 md:items-center py-4"
          onMouseLeave={() => setActive(null)}
        >
          {(universes ?? []).map((u) => {
            const style = FOCUS[u.slug];
            const isActive = active === u.slug;
            const isDimmed = active !== null && !isActive;
            return (
              <article
                key={u.slug}
                onMouseEnter={() => setActive(u.slug)}
                onFocus={() => setActive(u.slug)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(null);
                }}
                className={`group relative overflow-hidden rounded-[20px] bg-stone/30 transition-all will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${
                  isActive
                    ? style?.active ?? 'z-10 -translate-y-2 scale-[1.04] ring-2 ring-gold shadow-float'
                    : isDimmed
                      ? 'md:scale-[0.97] opacity-70 saturate-[0.8] duration-500'
                      : 'hover:-translate-y-1 duration-500'
                }`}
              >
                {/* Full-bleed media + mild wash (polarity activates with P5 artwork) */}
                <div className="absolute inset-0">
                  {u.emblem_src && (
                    <img
                      src={u.emblem_src}
                      alt={`${u.name} universe artwork`}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                        isActive ? style?.img ?? '' : ''
                      } ${isDimmed ? 'saturate-50' : ''}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-cream/55 via-cream/10 to-cream/50" />
                  {/* Focus-only mischief overlay: action-lines for heroes, petal
                      wash for anime, arch glow for itihaas */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    } ${
                      u.slug === 'heroverse'
                        ? 'bg-[repeating-linear-gradient(115deg,transparent_0_14px,rgba(217,38,61,0.10)_14px_16px)]'
                        : u.slug === 'animeverse'
                          ? 'bg-[radial-gradient(circle_at_80%_10%,rgba(244,167,195,0.35),transparent_55%)]'
                          : 'bg-[radial-gradient(ellipse_at_50%_120%,rgba(185,138,47,0.35),transparent_60%)]'
                    }`}
                  />
                </div>

                {/* Goofy drop sticker — pops in only on focus, each with its own tilt */}
                <span
                  aria-hidden="true"
                  className={`absolute top-4 right-4 z-20 rounded-full px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em] shadow-float transition-all duration-300 ${
                  style?.sticker ?? 'bg-gold text-on-gold'
                  } ${
                    isActive
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none scale-50 opacity-0'
                  }`}
                >
                  {style?.stickerLabel ?? 'Featured'}
                </span>

                {/* Editorial stack at top, count + CTA anchored bottom-left */}
                <div className="relative z-10 flex h-full flex-col p-6 min-h-[430px]">
                  <div className="max-w-[92%]">
                    <h3
                      className={`font-serif text-3xl md:text-[38px] leading-[1.05] transition-transform duration-500 ${
                        isActive && u.slug === 'animeverse'
                          ? '-rotate-1'
                          : isActive && u.slug === 'heroverse'
                            ? 'rotate-1 scale-[1.02]'
                            : isActive
                              ? 'italic'
                              : ''
                      }`}
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
                      className="mt-3.5 inline-flex w-fit items-center gap-2 rounded-md px-8 py-3 font-serif text-[17px] text-on-gold bg-gold hover:bg-gold-hover min-h-[44px] transition-all group-hover:gap-3"
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
