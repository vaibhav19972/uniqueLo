import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useCraftTechnique, useProducts } from '../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../lib/data';
import { piecesInTechnique } from '../lib/techniques';
import { firstRealImage } from '../lib/imagery';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const AtelierTechnique: React.FC = () => {
  const { techniqueSlug } = useParams<{ techniqueSlug: string }>();
  const { data: craft, isPending } = useCraftTechnique(techniqueSlug);
  const { data: products } = useProducts();

  const matching = useMemo(
    () => (techniqueSlug ? piecesInTechnique(products, techniqueSlug) : []),
    [products, techniqueSlug],
  );

  const heroSample = matching[0];
  const heroPlate = firstRealImage(
    heroSample?.embroidery?.macroImage?.src,
    heroSample?.images?.[1]?.src,
    heroSample?.images?.[0]?.src,
  );
  const heroPlateAlt =
    heroSample?.embroidery?.macroImage?.alt || heroSample?.images?.[1]?.alt || heroSample?.name || '';

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white py-16 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-800 animate-pulse">
          Reading technique archive…
        </p>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Technique Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">The craft taxonomy holds nine living traditions.</p>
        <Link to="/our-craft" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          Back to Craft Taxonomy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Technique Header ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/our-craft" className="hover:text-black transition-colors">The Craft</Link>
            <span>/</span>
            <span className="text-black">{craft.name}</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-xs bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {craft.region}
                </span>
                <span className="rounded-xs bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                  {craft.stitchType}
                </span>
              </div>

              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {craft.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base font-bold text-red-600">
                ⏱ {craft.artisanPace} · {craft.cluster}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl">
                {craft.description}
              </p>
            </div>

            {heroPlate && (
              <div className="h-44 w-60 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 shadow-md">
                <img
                  src={heroPlate}
                  alt={`${heroPlateAlt} — worked in ${craft.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Specs & Provenance Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stitch Mechanism</p>
            <p className="font-display text-sm font-bold text-neutral-900 mt-1">{craft.stitchType}</p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Artisan Working Pace</p>
            <p className="font-display text-sm font-bold text-neutral-900 mt-1">{craft.artisanPace}</p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Regional Cluster</p>
            <p className="font-display text-sm font-bold text-neutral-900 mt-1">{craft.region}</p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Guild Collective</p>
            <p className="font-display text-sm font-bold text-neutral-900 mt-1">{craft.cluster}</p>
          </div>
        </div>

        {/* Provenance narrative */}
        <div className="mt-6 rounded-md border border-neutral-200 bg-white p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-900">
            Historical Provenance
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            {craft.historicalContext}
          </p>
        </div>

        {/* Pieces in this technique */}
        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">
              Pieces Worked in {craft.name} ({matching.length})
            </h2>
            {matching.length > 0 && (
              <Link
                to={`/shop?technique=${craft.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4 hover:text-red-600 transition-colors"
              >
                Filter Full Shop →
              </Link>
            )}
          </div>

          {matching.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matching.map((p) => {
                const variant = getDefaultVariant(p);
                const plate = firstRealImage(
                  p.embroidery?.macroImage?.src,
                  p.images?.[1]?.src,
                  p.images?.[0]?.src,
                );
                return (
                  <Link
                    key={p.slug}
                    to={`/product/${p.slug}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-md border border-neutral-200 bg-white p-4 shadow-xs hover:border-black hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="aspect-[3/4] overflow-hidden rounded-xs bg-neutral-100 mb-3">
                        {plate && (
                          <img
                            src={plate}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-tight text-neutral-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs font-black text-[#D32F2F] mt-1">
                        {variant ? formatPrice(variant.priceCents) : '—'}
                      </p>
                      {p.embroidery?.motifStory && (
                        <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                          {p.embroidery.motifStory}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 text-[10px] text-neutral-500">
                      <span>{p.embroidery?.artisanHours ? `${p.embroidery.artisanHours}h Threadwork` : 'Artisan Crafted'}</span>
                      {p.fabricGsm && <span>{p.fabricGsm} GSM Cotton</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-500 border border-neutral-200 rounded-md bg-neutral-50">
              No pieces are currently in active stock for this technique. The craft method remains preserved in our archive.
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
