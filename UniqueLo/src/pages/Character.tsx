import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useUniverse, useCharacter, useMotifsByUniverse } from '../hooks/useCatalog';
import { filterProducts, ART_STYLES, GARMENTS, type FilterState, type ArtStyleSlug } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Character own page — /universes/:universeSlug/characters/:characterId.
 * Lore header (motif name/meaning/notes) + art-style + garment refinement + grid.
 * Breadcrumb law: Home / Universes / {Universe} / {Character}.
 * Follows unified Atelier quiet-luxury design system.
 */
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
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-ink">Unfolding character…</p>
      </div>
    );
  }

  if (!universe || !character || character.universe_slug !== universe.slug) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Character not found</h1>
        <p className="text-sm text-ink-muted mt-2">This thread leads nowhere — yet.</p>
        <Link to="/universes" className="inline-block mt-6 text-sm underline underline-offset-4">
          Back to the Universes
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Hero — unified Atelier quiet-luxury layout */}
      <section className="relative overflow-hidden bg-paper border-b border-stone/50 text-ink">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/universes" className="hover:underline">Universes</Link>
            <span className="mx-2">›</span>
            <Link to={`/universes/${universe.slug}`} className="hover:underline">{universe.name}</Link>
            <span className="mx-2">›</span>
            <span>{character.name}</span>
          </nav>
          <h1 className="font-serif font-medium tracking-tight leading-[1.05] mt-4 text-5xl sm:text-6xl lg:text-7xl max-w-3xl text-ink">
            {character.name}
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl mt-3 text-ink-muted">{character.meaning}</p>
          {character.symbol_notes && (
            <p className="font-serif text-base sm:text-lg mt-4 max-w-2xl leading-relaxed text-ink/80">
              {character.symbol_notes}
            </p>
          )}
          {(siblings ?? []).length > 1 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {(siblings ?? [])
                .filter((s) => s.id !== character.id)
                .map((s) => (
                  <Link
                    key={s.id}
                    to={`/universes/${universe.slug}/characters/${s.id}`}
                    className="rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] border border-stone/70 bg-cream/50 text-ink hover:border-ink transition-colors inline-flex items-center cursor-pointer"
                  >
                    {s.name} <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      <section aria-label={`${character.name} collection`} className="bg-cream">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setGarment('all'); setArtStyle('all'); }}
              aria-pressed={garment === 'all' && artStyle === 'all'}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                garment === 'all' && artStyle === 'all'
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
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer capitalize ${
                  garment === g
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink border border-stone bg-paper hover:border-ink'
                }`}
              >
                {garmentLabel(g)}
              </button>
            ))}
            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />
            {ART_STYLES.filter((s) =>
              (allProducts ?? []).some(
                (p) => p.universeSlug === universe.slug && p.artStyleSlug === s.slug,
              ),
            ).map((s) => (
              <button
                key={s.slug}
                onClick={() => setArtStyle(s.slug === artStyle ? 'all' : s.slug)}
                aria-pressed={artStyle === s.slug}
                title={s.tagline}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                  artStyle === s.slug
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink'
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
    </div>
  );
};
