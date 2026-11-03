import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useUniverse, useCharacter, useMotifsByUniverse } from '../hooks/useCatalog';
import { filterProducts, ART_STYLES, GARMENTS, type FilterState, type ArtStyleSlug } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Character: React.FC = () => {
  const { universeSlug, characterId } = useParams<{ universeSlug: string; characterId: string }>();
  const { data: universe } = useUniverse(universeSlug);
  const { data: character } = useCharacter(characterId);
  const { data: siblings } = useMotifsByUniverse(universeSlug);
  const { data: allProducts } = useProducts();

  const [garment, setGarment] = useState<string>('all');
  const [artStyle, setArtStyle] = useState<ArtStyleSlug | 'all'>('all');

  const garmentTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts ?? []) {
      if (p.universeSlug === universeSlug && p.garmentType) set.add(p.garmentType);
    }
    return [...set].sort();
  }, [allProducts, universeSlug]);

  const garmentLabel = (g: string): string =>
    GARMENTS.find((gm) => gm.slug === g)?.name ?? `${g}s`;

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      universeSlug: universeSlug ?? 'all',
      garmentTypes: garment === 'all' ? [] : [garment],
      characterId: characterId ?? 'all',
      artStyleSlug: artStyle,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, universeSlug, garment, characterId, artStyle]);

  if (universe === undefined || character === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white py-16 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-800 animate-pulse">
          Unfolding character motif…
        </p>
      </div>
    );
  }

  if (!universe || !character || character.universe_slug !== universe.slug) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Character Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">This character thread leads nowhere yet.</p>
        <Link to="/universes" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          Back to Worlds
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Character Spotlight Masthead ── */}
      <section className="border-b border-neutral-200 bg-neutral-950 text-white pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/universes" className="hover:text-white transition-colors">Worlds</Link>
            <span>/</span>
            <Link to={`/universes/${universe.slug}`} className="hover:text-white transition-colors">{universe.name}</Link>
            <span>/</span>
            <span className="text-white">{character.name}</span>
          </nav>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-xs bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white mb-3">
                <span>✦</span>
                <span>{universe.name.toUpperCase()} CHARACTER CAPSULE</span>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
                {character.name}
              </h1>
              <p className="mt-2 text-base sm:text-lg font-bold text-neutral-300">
                {character.meaning}
              </p>
              {character.symbol_notes && (
                <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {character.symbol_notes}
                </p>
              )}

              {/* Sibling Characters Switcher */}
              {(siblings ?? []).length > 1 && (
                <div className="mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Other {universe.name} Characters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(siblings ?? [])
                      .filter((s) => s.id !== character.id)
                      .map((s) => (
                        <Link
                          key={s.id}
                          to={`/universes/${universe.slug}/characters/${s.id}`}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xs border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xs hover:bg-white hover:text-black transition"
                        >
                          {s.name} →
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Character Artwork Plate */}
            {character.image && (
              <div className="h-48 w-48 sm:h-56 sm:w-56 shrink-0 overflow-hidden rounded-lg border-2 border-white/20 shadow-xl bg-neutral-900">
                <img
                  src={character.image}
                  alt={character.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Character Pieces Showcase ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Silhouette Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 pb-4">
          <button
            type="button"
            onClick={() => { setGarment('all'); setArtStyle('all'); }}
            className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              garment === 'all' && artStyle === 'all'
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
              className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer capitalize ${
                garment === g
                  ? 'bg-black text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
              }`}
            >
              {garmentLabel(g)}
            </button>
          ))}

          <span className="hidden h-5 w-px bg-neutral-200 sm:block mx-1" />

          {ART_STYLES.filter((s) =>
            (allProducts ?? []).some(
              (p) => p.universeSlug === universe.slug && p.artStyleSlug === s.slug,
            ),
          ).map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setArtStyle(s.slug === artStyle ? 'all' : s.slug)}
              className={`min-h-[38px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                artStyle === s.slug
                  ? 'bg-red-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-black'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <ProductGrid products={filtered} cardType="quick" />
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
