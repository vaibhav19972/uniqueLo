import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import {
  EDITS,
  formatPrice,
  getDefaultVariant,
  getExpressionScore,
  type EditSlug,
  type ExpressionScore,
} from '../lib/data';
import { hasLicensedMark } from '../lib/licensed-marks';
import { useFiltersStore } from '../stores/filters';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Expressions: React.FC = () => {
  const { data: expressions } = useExpressions();
  const { data: allProducts } = useProducts();
  const setEdit = useFiltersStore((s) => s.setEdit);
  const setExpressionSlug = useFiltersStore((s) => s.setExpressionSlug);
  const navigate = useNavigate();

  // Interactive Mixer state
  const [selectedEditSlug, setSelectedEditSlug] = useState<EditSlug>('everyday');
  const [selectedScore, setSelectedScore] = useState<ExpressionScore>(3);

  // Filter merchandisable products
  const merchandisableProducts = useMemo(
    () => (allProducts ?? []).filter((p) => !hasLicensedMark(p)),
    [allProducts],
  );

  // Presence levels enriched with counts, starting prices, and sample items
  const levels = useMemo(() => {
    return (expressions ?? [])
      .slice()
      .sort((a, b) => a.score - b.score)
      .map((exp) => {
        const matching = merchandisableProducts.filter(
          (p) => getExpressionScore(p) === exp.score,
        );
        const priced = matching
          .map((p) => getDefaultVariant(p)?.priceCents ?? 0)
          .filter((price) => price > 0)
          .sort((a, b) => a - b);

        return {
          exp,
          count: matching.length,
          from: priced[0] ?? null,
          sample: matching[0] ?? null,
          image: exp.image || `/images/expression/${exp.slug}.jpg`,
        };
      });
  }, [expressions, merchandisableProducts]);

  // Edits enriched with counts, starting prices, and samples
  const editsData = useMemo(() => {
    return EDITS.map((e) => {
      const matching = merchandisableProducts.filter((p) =>
        (p.edits ?? []).includes(e.slug),
      );
      const priced = matching
        .map((p) => getDefaultVariant(p)?.priceCents ?? 0)
        .filter((price) => price > 0)
        .sort((a, b) => a - b);

      return {
        ...e,
        count: matching.length,
        from: priced[0] ?? null,
        sample: matching[0] ?? null,
        image: `/images/edits/${e.slug}.jpg`,
      };
    });
  }, [merchandisableProducts]);

  // Mixer calculation: products matching BOTH selected edit and selected score
  const mixerMatches = useMemo(() => {
    return merchandisableProducts.filter((p) => {
      const hasEdit = (p.edits ?? []).includes(selectedEditSlug);
      const hasScore = getExpressionScore(p) === selectedScore;
      return hasEdit && hasScore;
    });
  }, [merchandisableProducts, selectedEditSlug, selectedScore]);

  // Quick randomizer for the playful mixer
  const randomizeMixer = () => {
    const randomEdit = EDITS[Math.floor(Math.random() * EDITS.length)]!;
    const scores: ExpressionScore[] = [1, 2, 3, 4, 5];
    const randomScore = scores[Math.floor(Math.random() * scores.length)]!;
    setSelectedEditSlug(randomEdit.slug);
    setSelectedScore(randomScore);
  };

  const handleLaunchMixerShop = () => {
    const selectedLevel = levels.find((l) => l.exp.score === selectedScore);
    setEdit(selectedEditSlug);
    if (selectedLevel) {
      setExpressionSlug(selectedLevel.exp.slug as any);
      navigate(`/shop?edit=${selectedEditSlug}&expression=${selectedLevel.exp.slug}`);
    } else {
      navigate(`/shop?edit=${selectedEditSlug}`);
    }
  };

  const totalPieces = merchandisableProducts.length;

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">Styles &amp; Presence</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>DUAL-AXIS STREETWEAR STUDIO</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Styles &amp; Presence Studio
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Where purpose meets presence. Explore by <strong className="font-bold text-neutral-900">Curated Edit</strong> for the occasion, or dial your <strong className="font-bold text-neutral-900">Presence Meter</strong> from whisper-quiet tonal stitching to full-panel maximalism.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {totalPieces} Pieces
              </span>
              <span className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700">
                5 Presence Tiers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Streetwear Style Mixer ── */}
      <section className="border-b border-neutral-200 bg-neutral-950 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                ✦ LIVE INTERACTIVE DECK
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
                The Fit Mixer
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pair an occasion intent with an embroidery volume level.
              </p>
            </div>

            <button
              type="button"
              onClick={randomizeMixer}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xs border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xs hover:bg-white hover:text-black transition"
            >
              <span>🎲 Shuffle Fit</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {/* Dial 1: Occasion Edit */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2.5">
                  1. Select Occasion Edit:
                </label>
                <div className="flex flex-wrap gap-2">
                  {EDITS.map((e) => {
                    const isSelected = selectedEditSlug === e.slug;
                    return (
                      <button
                        key={e.slug}
                        type="button"
                        onClick={() => setSelectedEditSlug(e.slug)}
                        className={`min-h-[40px] rounded-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-white text-black shadow-md scale-102'
                            : 'border border-white/20 bg-white/5 text-neutral-300 hover:border-white/60'
                        }`}
                      >
                        {e.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dial 2: Presence Level Slider (1 to 5) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    2. Dial Presence Volume (1 to 5):
                  </label>
                  <span className="rounded-xs bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    Level {selectedScore}: {levels.find((l) => l.exp.score === selectedScore)?.exp.name.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = selectedScore === score;
                    const level = levels.find((l) => l.exp.score === score);
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSelectedScore(score as ExpressionScore)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xs border text-center transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-600 text-white font-black ring-2 ring-red-400/40'
                            : 'border-white/15 bg-white/5 text-neutral-300 hover:border-white/40'
                        }`}
                      >
                        <span className="font-display text-base sm:text-lg font-black">{score}</span>
                        <span className="text-[9px] uppercase tracking-tight truncate w-full mt-0.5">
                          {level?.exp.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mixer Output Panel */}
            <div className="rounded-lg border border-white/15 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mixer Match</span>
                  <h3 className="font-display text-xl font-black uppercase text-white mt-0.5">
                    {mixerMatches.length} Matching Pieces
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchMixerShop}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xs bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-neutral-200 transition"
                >
                  <span>Shop This Look</span>
                  <span>→</span>
                </button>
              </div>

              {/* Sample preview thumbnails */}
              {mixerMatches.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {mixerMatches.slice(0, 3).map((p) => (
                    <Link
                      key={p.slug}
                      to={`/product/${p.slug}`}
                      className="group block overflow-hidden rounded-xs border border-white/10 bg-neutral-900"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={p.images[0]?.src || '/images/placeholders/hoodie.jpg'}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-1.5 bg-neutral-950">
                        <p className="text-[10px] font-bold uppercase truncate text-white">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-black text-red-400">
                          {formatPrice(getDefaultVariant(p).priceCents)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-neutral-400 text-xs">
                  No direct combinations found for this pairing. Try tweaking the presence volume!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Presence Meter Breakdown ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              STITCH INTENSITY METRIC
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              The 5 Presence Levels
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              From whisper-quiet tonal stitching to full-panel tapestry streetwear.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {levels.map((item) => (
            <Link
              key={item.exp.slug}
              to={`/styles/${item.exp.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black font-display text-sm font-black text-white">
                    {item.exp.score}
                  </span>
                  <span className="rounded-xs bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                    {item.count} pieces
                  </span>
                </div>

                <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 mt-3 group-hover:text-red-600 transition-colors">
                  {item.exp.name}
                </h3>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  {item.exp.characteristics}
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2 line-clamp-3">
                  {item.exp.description}
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                {item.from ? (
                  <span className="font-black text-red-600">From {formatPrice(item.from)}</span>
                ) : (
                  <span className="text-neutral-400">Out of Stock</span>
                )}
                <span className="font-bold uppercase tracking-wider text-black group-hover:translate-x-1 transition-transform">
                  Shop →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Curated Occasion Edits ── */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              CURATED WARDROBE OCCASIONS
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              Curated Edits
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {editsData.map((edit) => (
              <Link
                key={edit.slug}
                to={`/shop?edit=${edit.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
              >
                <div>
                  <span className="rounded-xs bg-neutral-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-600">
                    {edit.count} Pieces
                  </span>
                  <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 mt-2 group-hover:text-red-600 transition-colors">
                    {edit.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1 line-clamp-3">
                    {edit.tagline}
                  </p>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                  {edit.from && (
                    <span className="font-black text-red-600">From {formatPrice(edit.from)}</span>
                  )}
                  <span className="font-bold uppercase tracking-wider text-black group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};

export const Styles = Expressions;
