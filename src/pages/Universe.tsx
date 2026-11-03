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
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

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
      <div className="flex min-h-[50vh] items-center justify-center bg-white py-16 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-800 animate-pulse">
          Unfolding universe capsule…
        </p>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Universe Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">This dimensional thread leads nowhere yet.</p>
        <Link to="/universes" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          Back to Worlds
        </Link>
      </div>
    );
  }

  const heroImage = universe.hero_image || '/images/placeholders/hero.jpg';
  const universeProducts = (allProducts ?? []).filter((p) => p.universeSlug === universeSlug);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Cinematic Universe Hero Banner ── */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={universe.name}
            className="h-full w-full object-cover object-center opacity-40"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hero.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/universes" className="hover:text-white transition-colors">Worlds</Link>
            <span>/</span>
            <span className="text-white">{universe.name}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-xs bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                {universe.hero_kicker || 'DROP CAPSULE'}
              </span>
              <span className="rounded-xs bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-200 backdrop-blur-xs">
                {universeProducts.length} Exclusive Pieces
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
              {universe.name}
            </h1>

            <p className="mt-3 text-base sm:text-lg font-bold text-neutral-200">
              {universe.tagline}
            </p>

            <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              {universe.lore}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#collection"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xs bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:bg-neutral-200 transition active:scale-98"
              >
                Explore Collection ↓
              </a>
              {motifs && motifs.length > 0 && (
                <a
                  href="#characters"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xs border border-white/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xs hover:border-white transition"
                >
                  Meet the Characters ({motifs.length})
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Character / Motif Story Rails (CategoryQuickNav Style) ── */}
      {motifs && motifs.length > 0 && (
        <section id="characters" className="border-b border-neutral-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-neutral-400">
                  Filter by Icon &amp; Character
                </h3>
              </div>
              {character !== 'all' && (
                <button
                  type="button"
                  onClick={() => setCharacter('all')}
                  className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline"
                >
                  Clear Character ({character})
                </button>
              )}
            </div>

            <div className="no-scrollbar flex items-center gap-4 overflow-x-auto pb-2">
              {/* All Characters Bubble */}
              <button
                type="button"
                onClick={() => setCharacter('all')}
                className="group flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all ${
                  character === 'all'
                    ? 'border-black bg-black text-white ring-2 ring-black/20'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-800 hover:border-black'
                }`}>
                  <span className="text-xs font-black uppercase">ALL</span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-tight text-neutral-700">
                  All
                </span>
              </button>

              {motifs.map((m) => {
                const count = (allProducts ?? []).filter((p) =>
                  getCharacterIds(p).includes(m.id),
                ).length;
                const isSelected = character === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCharacter(isSelected ? 'all' : m.id)}
                    className="group flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-black ring-2 ring-black/30 scale-105'
                        : 'border-neutral-200 hover:border-black'
                    }`}>
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-neutral-200 flex items-center justify-center font-bold text-xs">
                          {m.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight max-w-[70px] truncate text-center ${
                      isSelected ? 'text-black' : 'text-neutral-600'
                    }`}>
                      {m.name}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {count} {count === 1 ? 'fit' : 'fits'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Collection Product Showcase ── */}
      <section id="collection" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 pb-4">
          <button
            type="button"
            onClick={() => { setGarment('all'); setCharacter('all'); setArtStyle('all'); setExpression('all'); }}
            className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              garment === 'all' && character === 'all' && artStyle === 'all' && expression === 'all'
                ? 'bg-black text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
            }`}
          >
            All Silhouettes
          </button>

          {garmentTypes.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGarment(g === garment ? 'all' : g)}
              className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                garment === g
                  ? 'bg-black text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
              }`}
            >
              {garmentLabel(g)}
            </button>
          ))}

          <span className="hidden h-5 w-px bg-neutral-200 sm:block mx-1" />

          {EXPRESSION_LEVELS.map((e) => (
            <button
              key={e.score}
              type="button"
              onClick={() => setExpression(e.score === expression ? 'all' : e.score)}
              title={e.tagline}
              className={`min-h-[38px] rounded-xs px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                expression === e.score
                  ? 'bg-red-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-black'
              }`}
            >
              L{e.score} {e.name}
            </button>
          ))}

          {universeArtStyles.length > 0 && (
            <>
              <span className="hidden h-5 w-px bg-neutral-200 sm:block mx-1" />
              {universeArtStyles.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setArtStyle(s.slug === artStyle ? 'all' : s.slug)}
                  title={s.tagline}
                  className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    artStyle === s.slug
                      ? 'bg-black text-white'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:border-black'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Product Grid */}
        <div className="mt-6">
          <ProductGrid products={filtered} cardType="quick" />
        </div>
      </section>

      {/* Complete the Look Bundle */}
      <BundleBand universeSlug={universe.slug} universeName={universe.name} />

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
