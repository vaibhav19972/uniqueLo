import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useUniverse, useMotifsByUniverse } from '../hooks/useCatalog';
import { filterProducts, type FilterState, type Vibe } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { BundleBand } from '../components/shop/BundleBand';

const VIBE_OPTIONS: Vibe[] = ['aesthetic', 'clean', 'minimal', 'expressive'];

/**
 * Render target 08: themed universe landing.
 * Same skeleton for every universe — only tokens + lore + products differ.
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

  return (
    <div data-universe={universe.slug} className="w-full">
      {/* Themed hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--u-surface)', color: 'var(--u-ink)' }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] opacity-70">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/shop" className="hover:underline">Universes</Link>
            <span className="mx-2">›</span>
            <span>{universe.name}</span>
          </nav>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl mt-4 tracking-tight uppercase">
            {universe.name}
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl mt-2 opacity-90">{universe.tagline}</p>
          <p className="text-sm sm:text-base mt-4 max-w-2xl font-light leading-relaxed opacity-80">
            {universe.lore}
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#collection"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-serif text-[17px] min-h-[48px] bg-gold text-cream hover:bg-gold-hover transition-colors"
            >
              Explore Collection <span aria-hidden="true">→</span>
            </a>
            <a
              href="#lore"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium border border-current min-h-[48px]"
            >
              Read the Lore <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* Lore strip */}
      <section id="lore" aria-label={`${universe.name} lore`} className="bg-cream border-b border-stone/60">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          <p className="text-[11px] font-sans uppercase tracking-[0.28em] text-ink-muted">
            The {universe.name} lore
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-1">More Than Characters.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
            {(motifs ?? []).map((m) => (
              <article key={m.id} className="bg-paper border border-stone/60 p-5">
                <h3 className="font-serif text-xl text-ink">{m.name}</h3>
                <p className="text-sm text-ink-muted mt-1 leading-relaxed">{m.meaning}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" aria-label={`${universe.name} collection`} className="bg-cream">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setGarment('all')}
              aria-pressed={garment === 'all'}
              className={`px-4 py-2 text-xs uppercase tracking-widest border min-h-[44px] transition-colors ${
                garment === 'all' ? 'text-cream bg-gold border-transparent' : 'text-ink border-stone hover:border-ink'
              }`}
            >
              All
            </button>
            {garmentTypes.map((g) => (
              <button
                key={g}
                onClick={() => setGarment(g === garment ? 'all' : g)}
                aria-pressed={garment === g}
                className={`px-4 py-2 text-xs uppercase tracking-widest border min-h-[44px] transition-colors capitalize ${
                  garment === g ? 'text-cream bg-gold border-transparent' : 'text-ink border-stone hover:border-ink'
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
                className={`px-4 py-2 text-xs uppercase tracking-widest border min-h-[44px] transition-colors capitalize ${
                  vibe === v ? 'text-ink border-ink bg-paper' : 'text-ink-muted border-stone hover:border-ink'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <p className="text-xs text-ink-muted mt-4 uppercase tracking-widest">
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
