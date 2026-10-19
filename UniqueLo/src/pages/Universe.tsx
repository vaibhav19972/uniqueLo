import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useUniverse, useMotifsByUniverse } from '../hooks/useCatalog';
import {
  filterProducts,
  ART_STYLES,
  getCharacterIds,
  EXPRESSION_LEVELS,
  type FilterState,
  type ArtStyleSlug,
  type ExpressionScore,
} from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { BundleBand } from '../components/shop/BundleBand';


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
  const [artStyle, setArtStyle] = useState<ArtStyleSlug | 'all'>('all');
  const [character, setCharacter] = useState<string>('all');
  const [expression, setExpression] = useState<ExpressionScore | 'all'>('all');

  const garmentTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts ?? []) {
      if (p.universeSlug === universeSlug && p.garmentType) set.add(p.garmentType);
    }
    return [...set].sort();
  }, [allProducts, universeSlug]);

  const universeArtStyles = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts ?? []) {
      if (p.universeSlug === universeSlug && p.artStyleSlug) set.add(p.artStyleSlug);
    }
    return ART_STYLES.filter((s) => set.has(s.slug));
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
      characterId: character === 'all' ? 'all' : character,
      artStyleSlug: artStyle,
      expressionScore: expression === 'all' ? undefined : expression,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, universeSlug, garment, character, artStyle, expression]);

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
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Hero — unified Atelier quiet-luxury layout */}
      <section className="relative overflow-hidden bg-paper border-b border-stone/50 text-ink">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20 relative z-10">
          <nav aria-label="Breadcrumb" className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/universes" className="hover:underline">Universes</Link>
            <span className="mx-2">›</span>
            <span>{universe.name}</span>
          </nav>

          {/* Ornament / kicker */}
          {universe.hero_ornament && (
            <svg className="w-8 h-8 mt-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {HERO_ORNAMENTS[universe.hero_ornament]}
            </svg>
          )}
          {universe.hero_kicker && (
            <p className="font-serif text-xl mt-5 tracking-[0.2em] text-accent" aria-hidden="true">
              {universe.hero_kicker}
            </p>
          )}

          {/* Headline */}
          <h1
            className={`font-serif font-semibold tracking-tight leading-[1.02] mt-2 ${isCaps ? 'uppercase text-5xl sm:text-7xl lg:text-8xl' : 'text-5xl sm:text-6xl lg:text-7xl max-w-3xl'}`}
          >
            {accentWord ? (
              <>
                <span>
                  {accentBefore}
                </span>
                <span className="text-accent">
                  {accentWord}
                </span>
                {accentAfter !== undefined && accentAfter !== '' && (
                  <span>
                    {accentAfter}
                  </span>
                )}
              </>
            ) : (
              headline
            )}
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl mt-3 text-ink-muted">{universe.tagline}</p>
          <p className="font-serif text-base sm:text-lg mt-4 max-w-2xl leading-relaxed text-ink/85">
            {universe.lore}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="#collection"
              className="inline-flex items-center gap-2 px-8 py-3.5 font-serif text-[17px] min-h-[48px] bg-ink text-cream hover:bg-ink/90 transition-colors rounded-sm"
            >
              Explore Collection <span aria-hidden="true">→</span>
            </a>
            <a
              href="#lore"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-serif border border-stone min-h-[48px] text-ink hover:border-ink transition-colors rounded-sm"
            >
              Read the Lore <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* Handwritten-style annotation */}
        {universe.hero_note && (
          <p className="hidden lg:block absolute top-8 right-10 font-sans text-[12px] uppercase tracking-[0.25em] text-ink-muted rotate-2 opacity-80" aria-hidden="true">
            {universe.hero_note}
          </p>
        )}

        {/* Vertical accent text along the right edge */}
        {universe.hero_vertical_text && (
          <p
            className="hidden lg:flex absolute top-28 right-6 font-serif text-lg text-ink-muted opacity-60 cursor-default"
            style={{ writingMode: 'vertical-rl' }}
            aria-hidden="true"
          >
            {universe.hero_vertical_text}
          </p>
        )}
      </section>

      {/* Lore strip — unified Atelier parchment panels */}
      <section id="lore" aria-label={`${universe.name} lore`} className="bg-cream border-b border-stone/60">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <p className="text-[12px] font-sans uppercase tracking-eyebrow font-medium text-gold-deep">
            The {universe.name} lore
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2 font-medium leading-display tracking-tight">
            {universe.lore_heading ?? 'More Than Characters.'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-7">
            {(motifs ?? []).map((m) => {
              const count = (allProducts ?? []).filter((p) =>
                getCharacterIds(p).includes(m.id),
              ).length;
              return (
                <Link
                  key={m.id}
                  to={`/universes/${universe.slug}/characters/${m.id}`}
                  className="group bg-parchment border border-stone/70 p-5 hover:border-ink transition-colors"
                >
                  <div className="aspect-[16/9] bg-stone/30 mb-4" aria-hidden="true" />
                  <h3 className="font-serif text-xl text-ink group-hover:text-accent transition-colors">
                    {m.name}
                  </h3>
                  <p className="font-serif text-sm text-ink-muted mt-1.5 leading-relaxed">{m.meaning}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] uppercase tracking-widest text-ink font-medium">
                    Shop character · {count} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
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
          {/* Filter chips — garments + characters + art styles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setGarment('all'); setCharacter('all'); setArtStyle('all'); setExpression('all'); }}
              aria-pressed={garment === 'all' && character === 'all' && artStyle === 'all' && expression === 'all'}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                garment === 'all' && character === 'all' && artStyle === 'all' && expression === 'all'
                  ? 'bg-ink text-cream border border-transparent font-medium'
                  : 'text-ink border border-stone bg-paper hover:border-ink'
              }`}
            >
              All
            </button>
            {garmentTypes.map((g) => (
              <button
                key={g}
                onClick={() => setGarment(g === garment ? 'all' : g)}
                aria-pressed={garment === g}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                  garment === g
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink border border-stone bg-paper hover:border-ink'
                }`}
              >
                {garmentLabel(g)}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />
            {EXPRESSION_LEVELS.map((e) => (
              <button
                key={e.score}
                onClick={() => setExpression(e.score === expression ? 'all' : e.score)}
                aria-pressed={expression === e.score}
                title={e.tagline}
                className={`rounded-full px-3.5 py-1.5 text-xs font-sans min-h-[44px] transition-colors cursor-pointer ${
                  expression === e.score
                    ? 'bg-accent text-cream border border-transparent font-medium shadow-sm'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink hover:text-ink'
                }`}
              >
                ✦ L{e.score} {e.name}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />
            {(motifs ?? []).map((m) => (
              <button
                key={m.id}
                onClick={() => setCharacter(m.id === character ? 'all' : m.id)}
                aria-pressed={character === m.id}
                title={m.meaning}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                  character === m.id
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink hover:text-ink'
                }`}
              >
                {m.name}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />
            {universeArtStyles.map((s) => (
              <button
                key={s.slug}
                onClick={() => setArtStyle(s.slug === artStyle ? 'all' : s.slug)}
                aria-pressed={artStyle === s.slug}
                title={s.tagline}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                  artStyle === s.slug
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink hover:text-ink'
                }`}
              >
                {s.name}
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