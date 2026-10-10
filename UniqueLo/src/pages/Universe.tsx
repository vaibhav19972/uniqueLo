import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useUniverse, useMotifsByUniverse } from '../hooks/useCatalog';
import { filterProducts, type FilterState, type Vibe } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { BundleBand } from '../components/shop/BundleBand';

const VIBE_OPTIONS: Vibe[] = ['aesthetic', 'clean', 'minimal', 'expressive'];

/** Jagged torn-paper divider strip (renders 8.x) — fill = the NEXT section's bg. */
const TORN_POINTS =
  '0% 100%, 0% 55%, 3% 85%, 7% 30%, 11% 75%, 15% 45%, 20% 90%, 25% 35%, 30% 70%, 35% 25%, 41% 80%, 47% 40%, 53% 85%, 59% 30%, 65% 75%, 71% 45%, 77% 90%, 83% 35%, 89% 70%, 94% 30%, 100% 65%, 100% 100%';

const HERO_ORNAMENTS: Record<string, React.ReactNode> = {
  lotus: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21c-5 0-8-3-8-8 0-6 5-10 13-10 0 8-2 18-5 18zm0 0V9" />
  ),
  compass: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2zm0 8a2 2 0 100 .01" />
  ),
};

/**
 * Render target 08: themed universe landing (chatgpt-v2 8.1–8.3).
 * Same skeleton for every universe — only tokens + lore + copy accents differ
 * (all copy accents come from universes.json, never hardcoded per slug).
 */
export const Universe: React.FC = () => {
  const { universeSlug } = useParams<{ universeSlug: string }>();
  const { data: universe } = useUniverse(universeSlug);
  const { data: motifs } = useMotifsByUniverse(universeSlug);
  const { data: allProducts } = useProducts();

  const [garment, setGarment] = useState<string>('all');
  const [vibe, setVibe] = useState<Vibe | 'all'>('all');

  const garmentTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts ?? []) {
      if (p.universeSlug === universeSlug && p.garmentType) set.add(p.garmentType);
    }
    return [...set].sort();
  }, [allProducts, universeSlug]);

  const garmentLabel = (g: string): string => {
    const irregular: Record<string, string> = {
      lowers: 'lowers',
      accessories: 'accessories',
      hoodie: 'hoodies',
    };
    return irregular[g] ?? `${g}s`;
  };

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      universeSlug: universeSlug ?? 'all',
      garmentTypes: garment === 'all' ? [] : [garment],
      vibe,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, universeSlug, garment, vibe]);

  if (universe === undefined) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-ink">Unfolding universe…</p>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Universe not found</h1>
        <p className="text-sm text-ink-muted mt-2">This thread leads nowhere — yet.</p>
        <Link to="/" className="inline-block mt-6 text-sm underline underline-offset-4">Back to the Atelier</Link>
      </div>
    );
  }

  const headline = universe.hero_headline ?? universe.name;
  const isCaps = universe.hero_headline_case === 'caps';
  const accentWord = universe.hero_headline_accent;
  // Two-tone split: 8.2 reads accent-first ("Extraordinary" gold), 8.3 accent-last —
  // split handles both orders; always-render with token fallbacks so no word vanishes.
  const [accentBefore, accentAfter] = accentWord
    ? headline.split(accentWord)
    : [undefined, undefined];

  return (
    <div data-universe={universe.slug} className="w-full">
      {/* Themed hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--u-bg)', color: 'var(--u-ink)' }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="font-sans text-[11px] uppercase tracking-[0.2em] opacity-70">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/shop" className="hover:underline">Universes</Link>
            <span className="mx-2">›</span>
            <span>{universe.name}</span>
          </nav>

          {/* Ornament / kicker (lotus mark, compass star, or kanji kicker) */}
          {universe.hero_ornament && (
            <svg className="w-8 h-8 mt-6" style={{ color: 'var(--u-accent-2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {HERO_ORNAMENTS[universe.hero_ornament]}
            </svg>
          )}
          {universe.hero_kicker && (
            <p className="font-serif text-xl mt-5 tracking-[0.2em]" style={{ color: 'var(--u-accent-2)' }} aria-hidden="true">
              {universe.hero_kicker}
            </p>
          )}

          {/* Headline — caps single-tone (8.1) or two-tone sentence (8.2/8.3) */}
          <h1
            className={`font-serif font-semibold tracking-tight leading-[1.02] mt-2 ${isCaps ? 'uppercase text-5xl sm:text-7xl lg:text-8xl' : 'text-5xl sm:text-6xl lg:text-7xl max-w-3xl'}`}
          >
            {accentWord ? (
              <>
                <span style={{ color: universe.hero_lead_color ?? 'var(--u-ink)' }}>
                  {accentBefore}
                </span>
                <span style={{ color: universe.hero_accent_color ?? 'var(--u-accent-2)' }}>
                  {accentWord}
                </span>
                {accentAfter !== undefined && accentAfter !== '' && (
                  <span style={{ color: universe.hero_lead_color ?? 'var(--u-ink)' }}>
                    {accentAfter}
                  </span>
                )}
              </>
            ) : (
              headline
            )}
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl mt-3 opacity-90">{universe.tagline}</p>
          <p className="font-serif text-base sm:text-lg mt-4 max-w-2xl leading-relaxed opacity-80">
            {universe.lore}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="#collection"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-serif text-[17px] min-h-[48px] bg-gold text-cream hover:bg-gold-hover transition-colors"
            >
              Explore Collection <span aria-hidden="true">→</span>
            </a>
            <a
              href="#lore"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-serif border border-current/60 min-h-[48px] hover:border-current transition-colors"
            >
              Read the Lore <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* Handwritten-style annotation (8.2) — tracked caps, no script face yet (logged) */}
        {universe.hero_note && (
          <p className="hidden lg:block absolute top-8 right-10 font-sans text-[12px] uppercase tracking-[0.25em] rotate-2 opacity-80" aria-hidden="true">
            {universe.hero_note}
          </p>
        )}

        {/* Vertical accent text along the right edge (8.1 kanji / 8.3 Devanagari) */}
        {universe.hero_vertical_text && (
          <p
            className="hidden lg:flex absolute top-28 right-6 font-serif text-lg opacity-75 cursor-default"
            style={{ writingMode: 'vertical-rl' }}
            aria-hidden="true"
          >
            {universe.hero_vertical_text}
          </p>
        )}

        {/* Torn-paper edge transitioning to the cream content zone */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-5 bg-cream"
          style={{ clipPath: `polygon(${TORN_POINTS})` }}
        />
      </section>

      {/* Lore strip — parchment panels per 8.3 (artwork slots activate at P5) */}
      <section id="lore" aria-label={`${universe.name} lore`} className="bg-cream border-b border-stone/60">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <p className="text-[12px] font-sans uppercase tracking-eyebrow font-medium text-gold">
            The {universe.name} lore
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2 font-medium leading-display tracking-tight">
            {universe.lore_heading ?? 'More Than Characters.'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-7">
            {(motifs ?? []).map((m) => (
              <article key={m.id} className="bg-parchment border border-stone/70 p-5">
                <div className="aspect-[16/9] bg-stone/30 mb-4" aria-hidden="true" />
                <h3 className="font-serif text-xl text-ink">{m.name}</h3>
                <p className="font-serif text-sm text-ink-muted mt-1.5 leading-relaxed">{m.meaning}</p>
              </article>
            ))}
            {(motifs ?? []).length > 0 && (motifs ?? []).length < 3 && (
              <article className="border border-dashed border-stone/70 p-5 flex items-center">
                <p className="font-serif text-sm text-ink-muted leading-relaxed">
                  More symbols join this row as the collection unfolds.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" aria-label={`${universe.name} collection`} className="bg-cream">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          {/* Filter chips — fully rounded pills (renders 8.x) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setGarment('all')}
              aria-pressed={garment === 'all'}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors ${
                garment === 'all' ? 'text-cream bg-gold border border-transparent' : 'text-ink border border-stone hover:border-ink'
              }`}
            >
              All
            </button>
            {garmentTypes.map((g) => (
              <button
                key={g}
                onClick={() => setGarment(g === garment ? 'all' : g)}
                aria-pressed={garment === g}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors ${
                  garment === g ? 'text-cream bg-gold border border-transparent' : 'text-ink border border-stone hover:border-ink'
                }`}
              >
                {garmentLabel(g)}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />
            {VIBE_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v === vibe ? 'all' : v)}
                aria-pressed={vibe === v}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors capitalize ${
                  vibe === v ? 'text-cream bg-gold border border-transparent' : 'text-ink-muted border border-stone hover:border-ink'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <p className="font-sans text-xs text-ink-muted mt-5">
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </p>

          <ProductGrid products={filtered} />
        </div>
      </section>

      {/* Complete the Look (render 08) */}
      <BundleBand universeSlug={universe.slug} universeName={universe.name} />
    </div>
  );
};