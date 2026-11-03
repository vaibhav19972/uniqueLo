import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Universes: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();

  const atelierCount = useMemo(
    () => (products ?? []).filter((p) => !p.universeSlug).length,
    [products],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      c[p.universeSlug] = (c[p.universeSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  // Universe sample piece images
  const sampleImages = useMemo(() => {
    const imgs: Record<string, string[]> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      if (!imgs[p.universeSlug]) imgs[p.universeSlug] = [];
      const src = p.images?.[0]?.src;
      if (src && imgs[p.universeSlug].length < 3 && !imgs[p.universeSlug].includes(src)) {
        imgs[p.universeSlug].push(src);
      }
    }
    return imgs;
  }, [products]);

  const worlds = useMemo(() => {
    const list = (universes ?? [])
      .map((u) => ({
        id: u.slug,
        name: u.name,
        tagline: u.tagline,
        lore: u.lore,
        heroImage: u.hero_image || '/images/placeholders/hero.jpg',
        emblem: u.emblem_src,
        accent: u.theme_tokens?.accent || '#D32F2F',
        cadence: u.drop_cadence || 'Limited seasonal drops',
        count: counts[u.slug] ?? 0,
        samples: sampleImages[u.slug] ?? [],
        to: `/universes/${u.slug}`,
      }))
      .filter((w) => w.count > 0);

    if (atelierCount > 0) {
      list.push({
        id: 'atelier',
        name: 'The Atelier',
        tagline: 'Pure Craft · Technique & Needlework Heritage',
        lore: 'Artisanal embroidery for its own sake: heritage needlecraft, heavy GSM textiles, and architectural construction without a thematic universe.',
        heroImage: '/images/placeholders/hero.jpg',
        emblem: undefined,
        accent: '#111111',
        cadence: 'Archival core collection',
        count: atelierCount,
        samples: (products ?? []).filter((p) => !p.universeSlug).slice(0, 3).map((p) => p.images?.[0]?.src).filter(Boolean) as string[],
        to: '',
      });
    }
    return list;
  }, [universes, counts, sampleImages, atelierCount, products]);

  const enterAtelier = React.useCallback(() => {
    setUniverse('atelier');
    navigate('/shop');
  }, [setUniverse, navigate]);

  const totalPieces = worlds.reduce((n, w) => n + w.count, 0);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Hero Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">Worlds</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>ORIGINAL THEMATIC DIMENSIONS</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Worlds to Wear
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Step into distinct thematic dimensions. Each universe features original narratives, custom embroidery techniques, dedicated motifs, and limited capsule drops.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {totalPieces} Pieces
              </span>
              <span className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700">
                {worlds.length} Universes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visual Multiverse Cards Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {worlds.map((world) => (
            <div
              key={world.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
            >
              {/* Universe Banner Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                <img
                  src={world.heroImage}
                  alt={world.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="rounded-xs bg-black/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                    {world.count} {world.count === 1 ? 'Piece' : 'Pieces'}
                  </span>
                  <span className="rounded-xs bg-white/90 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-xs">
                    {world.cadence}
                  </span>
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-3 inset-x-4">
                  <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                    {world.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-neutral-200 line-clamp-1">
                    {world.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5 bg-white">
                <div>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                    {world.lore}
                  </p>

                  {/* Sample Pieces Thumbnails */}
                  {world.samples.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                        Preview Pieces
                      </span>
                      <div className="flex items-center gap-2">
                        {world.samples.map((src, idx) => (
                          <div key={idx} className="h-14 w-12 shrink-0 overflow-hidden rounded-xs border border-neutral-200 bg-neutral-100">
                            <img src={src} alt="Piece preview" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Explore Drop
                  </span>

                  <Link
                    to={world.to || '/shop'}
                    onClick={(e) => {
                      if (!world.to) {
                        e.preventDefault();
                        enterAtelier();
                      }
                    }}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xs bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-neutral-800 active:scale-98"
                  >
                    <span>Enter {world.name}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alternative Discovery Prompt */}
        <div className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6 sm:p-8 text-center">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-neutral-900">
            Want to Browse by Style &amp; Embroidery Density?
          </h3>
          <p className="mt-1.5 text-xs text-neutral-500 max-w-lg mx-auto">
            Discover pieces sorted by how loudly the needlework speaks — from minimal tonal monograms to full back-panel statement tapestries.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/styles"
              className="inline-flex min-h-[42px] items-center rounded-xs bg-black px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition"
            >
              Open Styles &amp; Edits Studio →
            </Link>
            <Link
              to="/clothing"
              className="inline-flex min-h-[42px] items-center rounded-xs border border-neutral-300 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black transition"
            >
              Shop by Garment Silhouette
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
