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

type ActiveViewTab = 'all' | 'mixer' | 'edits' | 'styles';

export const Expressions: React.FC = () => {
  const { data: expressions } = useExpressions();
  const { data: allProducts } = useProducts();
  const setEdit = useFiltersStore((s) => s.setEdit);
  const setExpressionSlug = useFiltersStore((s) => s.setExpressionSlug);
  const navigate = useNavigate();

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('all');

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
          image: `/images/expression/${exp.slug}.jpg`,
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
    <div className="min-h-screen w-full bg-cream">
      {/* ── Page Masthead & Hero ────────────────────────────────────── */}
      <section className="border-b border-stone bg-cream pb-10 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="loom-label text-ink-muted">
            <Link to="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2 text-stone">
              /
            </span>
            <span className="text-ink">Edits & Styles Studio</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[68ch]">
              <div className="flex items-center gap-2.5">
                <span className="loom-label text-[11px] font-semibold uppercase tracking-widest text-accent">
                  Dual Axis of Atelier Dressing
                </span>
                <span className="text-stone">·</span>
                <span className="loom-price text-[11px] text-ink-muted">
                  Intent & Intensity
                </span>
              </div>
              <h1
                className="loom-display mt-2 text-ink"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
              >
                Edits & Styles Studio
              </h1>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted sm:text-[16px]">
                Where purpose meets presence. Explore by <strong className="font-semibold text-ink">Curated Edit</strong> for the occasion, or dial your <strong className="font-semibold text-ink">Presence Level</strong> from whisper-quiet tonal stitching to full-panel maximalism.
              </p>
            </div>

            {/* Live Stats Pill Group */}
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <div className="border border-stone bg-paper px-4 py-2.5 text-center">
                <span className="loom-price block text-lg font-medium text-ink">{totalPieces}</span>
                <span className="loom-label text-[10px] text-ink-muted uppercase">Catalogue Pieces</span>
              </div>
              <div className="border border-stone bg-paper px-4 py-2.5 text-center">
                <span className="loom-price block text-lg font-medium text-ink">{editsData.length}</span>
                <span className="loom-label text-[10px] text-ink-muted uppercase">Curated Edits</span>
              </div>
              <div className="border border-stone bg-paper px-4 py-2.5 text-center">
                <span className="loom-price block text-lg font-medium text-ink">5</span>
                <span className="loom-label text-[10px] text-ink-muted uppercase">Volume Levels</span>
              </div>
            </div>
          </div>

          {/* ── View Controller Tabs ─────────────────────────────────── */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone pt-6">
            <div role="tablist" aria-label="Studio view selector" className="flex items-center">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                className={`min-h-[42px] border border-r-0 border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === 'all'
                    ? 'bg-ink text-cream'
                    : 'text-ink-muted hover:bg-paper hover:text-ink'
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'mixer'}
                onClick={() => setActiveTab('mixer')}
                className={`min-h-[42px] border border-r-0 border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === 'mixer'
                    ? 'bg-ink text-cream'
                    : 'text-ink-muted hover:bg-paper hover:text-ink'
                }`}
              >
                ✦ Interactive Mixer
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'edits'}
                onClick={() => setActiveTab('edits')}
                className={`min-h-[42px] border border-r-0 border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === 'edits'
                    ? 'bg-ink text-cream'
                    : 'text-ink-muted hover:bg-paper hover:text-ink'
                }`}
              >
                01 · Curated Edits
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'styles'}
                onClick={() => setActiveTab('styles')}
                className={`min-h-[42px] border border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === 'styles'
                    ? 'bg-ink text-cream'
                    : 'text-ink-muted hover:bg-paper hover:text-ink'
                }`}
              >
                02 · Presence Scale
              </button>
            </div>

            <span className="hidden font-sans text-[12px] text-ink-muted md:inline-block">
              Expressive discovery: mix & match your silhouette intent
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION: PLAYFUL & INTERACTIVE STYLE MIXER ──────────────── */}
      {(activeTab === 'all' || activeTab === 'mixer') && (
        <section className="border-b border-stone bg-paper/60 py-12 lg:py-16">
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-5">
              <div>
                <span className="loom-label text-[11px] uppercase tracking-wider text-accent font-semibold">
                  Creative Playground
                </span>
                <h2 className="loom-display mt-1 text-2xl text-ink sm:text-[1.85rem]">
                  The Style & Edit Mixer
                </h2>
                <p className="mt-1 font-sans text-[14px] text-ink-muted">
                  Combine your occasion mood with your embroidery volume to surface exact matches in real time.
                </p>
              </div>

              <button
                type="button"
                onClick={randomizeMixer}
                className="inline-flex items-center gap-2 border border-stone bg-cream px-3.5 py-2 font-sans text-[12px] font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
              >
                <span aria-hidden="true">🎲</span>
                <span>Surprise Mix</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Controls Column */}
              <div className="space-y-8 lg:col-span-7">
                {/* 1. Pick Edit */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="loom-label text-xs uppercase tracking-wider text-ink font-semibold">
                      Step 1 · Choose Your Intent (Edit)
                    </label>
                    <span className="loom-price text-[11px] text-ink-muted">
                      {EDITS.find((e) => e.slug === selectedEditSlug)?.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {EDITS.map((e) => {
                      const isSelected = selectedEditSlug === e.slug;
                      return (
                        <button
                          key={e.slug}
                          type="button"
                          onClick={() => setSelectedEditSlug(e.slug)}
                          className={`flex flex-col justify-between border p-3 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-ink bg-ink text-cream shadow-md -translate-y-0.5'
                              : 'border-stone bg-paper text-ink hover:border-stone-strong hover:bg-cream'
                          }`}
                        >
                          <span className={`loom-label text-[10px] uppercase tracking-wider ${isSelected ? 'text-cream/70' : 'text-ink-muted'}`}>
                            Capsule
                          </span>
                          <span className="mt-1 font-sans text-[13px] font-medium leading-tight">
                            {e.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Pick Presence Volume */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="loom-label text-xs uppercase tracking-wider text-ink font-semibold">
                      Step 2 · Dial Embroidery Presence (Volume)
                    </label>
                    <span className="loom-price text-[11px] text-accent font-medium">
                      Level {selectedScore}/5 · {levels.find((l) => l.exp.score === selectedScore)?.exp.name}
                    </span>
                  </div>

                  {/* 5-Step Stepped Dial */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {levels.map(({ exp }) => {
                      const isSelected = selectedScore === exp.score;
                      return (
                        <button
                          key={exp.score}
                          type="button"
                          onClick={() => setSelectedScore(exp.score as ExpressionScore)}
                          className={`flex flex-col items-center justify-between border py-3 px-1 text-center transition-all duration-200 ${
                            isSelected
                              ? 'border-ink bg-ink text-cream shadow-md -translate-y-0.5'
                              : 'border-stone bg-paper text-ink hover:border-stone-strong hover:bg-cream'
                          }`}
                        >
                          <span className={`loom-price text-xs font-mono font-medium ${isSelected ? 'text-cream' : 'text-ink-muted'}`}>
                            {String(exp.score).padStart(2, '0')}
                          </span>
                          <div className="my-2 flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, barIdx) => (
                              <div
                                key={barIdx}
                                className={`h-2.5 w-1 ${
                                  barIdx < exp.score
                                    ? isSelected
                                      ? 'bg-accent'
                                      : 'bg-ink'
                                    : isSelected
                                    ? 'bg-cream/20'
                                    : 'bg-stone'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-sans text-[11px] font-medium truncate max-w-full">
                            {exp.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2.5 font-sans text-[12.5px] text-ink-muted">
                    {levels.find((l) => l.exp.score === selectedScore)?.exp.description}
                  </p>
                </div>
              </div>

              {/* Mixer Output & Real-time Live Matches Column */}
              <div className="flex flex-col justify-between border border-stone bg-paper p-5 sm:p-6 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between border-b border-stone pb-3.5">
                    <span className="loom-label text-ink-muted uppercase">Live Combination Match</span>
                    <span className="loom-price text-xs font-semibold text-accent">
                      {mixerMatches.length} {mixerMatches.length === 1 ? 'piece' : 'pieces'} available
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="loom-label text-[11px] uppercase bg-ink/10 px-2 py-0.5 text-ink">
                        {EDITS.find((e) => e.slug === selectedEditSlug)?.title}
                      </span>
                      <span className="text-stone">×</span>
                      <span className="loom-label text-[11px] uppercase bg-ink/10 px-2 py-0.5 text-ink">
                        Level {selectedScore}: {levels.find((l) => l.exp.score === selectedScore)?.exp.name}
                      </span>
                    </div>

                    <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-muted">
                      {EDITS.find((e) => e.slug === selectedEditSlug)?.tagline} Threadwork placed at{' '}
                      <span className="text-ink font-medium">
                        {levels.find((l) => l.exp.score === selectedScore)?.exp.characteristics}
                      </span>.
                    </p>
                  </div>

                  {/* Matching Products Preview Strip */}
                  <div className="mt-5 space-y-2.5">
                    {mixerMatches.slice(0, 3).map((product) => {
                      const v = getDefaultVariant(product);
                      return (
                        <Link
                          key={product.slug}
                          to={`/product/${product.slug}`}
                          className="group flex items-center gap-3 border border-stone/60 bg-cream/40 p-2 transition-colors hover:border-ink hover:bg-cream"
                        >
                          <div className="h-12 w-10 shrink-0 overflow-hidden bg-panel">
                            {product.images?.[0]?.src ? (
                              <img
                                src={product.images[0].src}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full bg-stone" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-sans text-[13px] font-medium text-ink group-hover:text-accent">
                              {product.name}
                            </h4>
                            <p className="loom-price text-[11px] text-ink-muted">
                              {v?.priceCents ? formatPrice(v.priceCents) : ''}
                            </p>
                          </div>
                          <span className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      );
                    })}

                    {mixerMatches.length === 0 && (
                      <div className="py-8 text-center text-ink-muted font-sans text-xs">
                        No pieces currently match this exact intersection in the active drop. Try adjusting volume or edit!
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone">
                  <button
                    type="button"
                    onClick={handleLaunchMixerShop}
                    disabled={mixerMatches.length === 0}
                    className="flex w-full items-center justify-center gap-2 bg-ink py-3.5 px-4 font-sans text-[12px] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <span>Shop This Combination ({mixerMatches.length})</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 1: CURATED EDITS (THE INTENT) ───────────────────── */}
      {(activeTab === 'all' || activeTab === 'edits') && (
        <section className="border-b border-stone bg-cream py-12 lg:py-16">
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-5">
              <div className="max-w-[62ch]">
                <div className="flex items-center gap-2.5">
                  <span className="loom-label text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Axis 01 · Buyer Intent
                  </span>
                  <span className="text-stone">/</span>
                  <span className="loom-price text-[11px] text-ink-muted">
                    {editsData.length} curated capsules
                  </span>
                </div>
                <h2 className="loom-display mt-1 text-2xl text-ink sm:text-[1.85rem]">
                  The Curated Edits
                </h2>
                <p className="mt-1 font-sans text-[14px] leading-relaxed text-ink-muted">
                  Organized by lifestyle intent and moment — from effortless daily essentials to heirloom collector releases.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent"
              >
                All pieces in shop
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Rich Editorial Cards Grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {editsData.map((e, i) => (
                <Link
                  key={e.slug}
                  to={`/shop?edit=${e.slug}`}
                  onClick={() => setEdit(e.slug as EditSlug)}
                  className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden border border-stone bg-paper text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:shadow-xl focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {/* Photo */}
                  <img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                    onError={(ev) => {
                      (ev.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Scrims */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 via-ink/25 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/95 via-ink/60 via-50% to-transparent transition-opacity duration-300 group-hover:from-ink/90 group-hover:via-ink/50"
                  />

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 border border-cream/20 bg-ink/75 px-2.5 py-1 backdrop-blur-md">
                      <span className="loom-price text-[11px] font-medium text-cream">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-cream/40 font-mono">/</span>
                      <span className="loom-price text-[10px] text-cream/60">
                        {String(editsData.length).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="loom-label border border-cream/20 bg-ink/65 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-cream/90 backdrop-blur-md">
                      {e.count} {e.count === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>

                  {/* Bottom Bar */}
                  <div className="relative z-10 flex flex-col justify-end p-4 sm:p-5">
                    <span className="loom-label text-[10px] uppercase tracking-widest text-cream/70">
                      Curated Edit
                    </span>
                    <h3 className="loom-display mt-0.5 text-2xl text-cream leading-tight transition-colors duration-300 group-hover:text-accent sm:text-[1.65rem]">
                      {e.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 font-sans text-[12.5px] leading-relaxed text-cream/80 sm:text-[13px]">
                      {e.tagline}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-cream/20 pt-3">
                      {e.from != null ? (
                        <span className="loom-price text-[12px] font-medium text-cream/90">
                          from {formatPrice(e.from)}
                        </span>
                      ) : (
                        <span className="loom-label text-[10.5px] uppercase tracking-wider text-cream/70">
                          Explore capsule
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-cream transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                        <span>Explore</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: PRESENCE SCALE (THE VOLUME) ──────────────────── */}
      {(activeTab === 'all' || activeTab === 'styles') && (
        <section className="border-b border-stone bg-paper/30 py-12 lg:py-16">
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-5">
              <div className="max-w-[62ch]">
                <div className="flex items-center gap-2.5">
                  <span className="loom-label text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Axis 02 · Embroidery Volume
                  </span>
                  <span className="text-stone">/</span>
                  <span className="loom-price text-[11px] text-ink-muted">
                    5 measured levels
                  </span>
                </div>
                <h2 className="loom-display mt-1 text-2xl text-ink sm:text-[1.85rem]">
                  How Loudly It Wears
                </h2>
                <p className="mt-1 font-sans text-[14px] leading-relaxed text-ink-muted">
                  How much space the needlecraft commands on the garment — from intimate tonal emblems to procession relief.
                </p>
              </div>

              <span className="loom-label text-[11px] text-ink-muted uppercase">
                Independent of World
              </span>
            </div>

            {/* The 5-Level Visual Spectrum */}
            <div className="mt-8 space-y-6">
              {levels.map(({ exp, count, from, sample, image }) => (
                <div
                  key={exp.score}
                  className="group relative overflow-hidden border border-stone bg-paper transition-all duration-300 hover:border-ink hover:shadow-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                    {/* Visual Thumbnail Column */}
                    <div className="relative aspect-[4/3] md:aspect-auto md:col-span-4 lg:col-span-3 overflow-hidden bg-panel">
                      <img
                        src={image}
                        alt={exp.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                        onError={(ev) => {
                          (ev.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute left-3 top-3 grid h-8 w-8 place-items-center bg-ink text-cream font-mono text-xs font-semibold">
                        0{exp.score}
                      </div>
                    </div>

                    {/* Metadata & Description Column */}
                    <div className="p-6 md:col-span-8 lg:col-span-9 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-stone pb-3">
                          <div className="flex items-baseline gap-3">
                            <h3 className="loom-display text-2xl text-ink group-hover:text-accent transition-colors">
                              {exp.name}
                            </h3>
                            {/* Visual volume meter */}
                            <div className="flex items-center gap-1" title={`Level ${exp.score} of 5`}>
                              {Array.from({ length: 5 }).map((_, barIdx) => (
                                <div
                                  key={barIdx}
                                  className={`h-2.5 w-1 ${
                                    barIdx < exp.score ? 'bg-accent' : 'bg-stone'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-baseline gap-3">
                            <span className="loom-price text-xs text-ink-muted">
                              {count} {count === 1 ? 'piece' : 'pieces'}
                            </span>
                            {from != null && (
                              <span className="loom-price text-xs font-medium text-ink">
                                from {formatPrice(from)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12">
                          <div className="lg:col-span-7">
                            <p className="font-sans text-[14px] font-medium text-ink">
                              {exp.tagline}
                            </p>
                            <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink-muted">
                              {exp.description}
                            </p>
                          </div>

                          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone pt-3 lg:pt-0 lg:pl-5">
                            <span className="loom-label text-[10px] uppercase text-ink-muted">
                              Visual Characteristics
                            </span>
                            <p className="mt-1 font-sans text-[12.5px] leading-snug text-ink">
                              {exp.characteristics}
                            </p>

                            {sample && (
                              <p className="mt-3 font-sans text-[11px] text-ink-muted">
                                <span>Example: </span>
                                <Link
                                  to={`/product/${sample.slug}`}
                                  className="font-medium text-ink underline transition-colors hover:text-accent"
                                >
                                  {sample.name}
                                </Link>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 flex items-center justify-between border-t border-stone pt-3">
                        <Link
                          to={`/styles/${exp.slug}`}
                          className="font-sans text-[12px] text-ink-muted hover:text-ink transition-colors"
                        >
                          View level profile & details →
                        </Link>

                        <Link
                          to={`/shop?expression=${exp.slug}`}
                          onClick={() => setExpressionSlug(exp.slug as any)}
                          className="inline-flex items-center gap-1.5 bg-ink px-4 py-2 font-sans text-[11px] uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
                        >
                          <span>Shop Level {exp.score} ({count})</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 3: SCENARIOS & PLAYFUL MATRIX INSPIRATION ─────────── */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
          <div className="border border-stone bg-paper p-6 sm:p-8 lg:p-10">
            <span className="loom-label text-[11px] uppercase tracking-wider text-accent font-semibold">
              Style Inspiration
            </span>
            <h3 className="loom-display mt-1 text-2xl text-ink sm:text-[1.75rem]">
              Three Signature Intersections
            </h3>
            <p className="mt-1 font-sans text-[14px] text-ink-muted max-w-[64ch]">
              Curious where to begin? Here is how our artisans recommend pairing intention with intensity.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Scenario 1 */}
              <div className="border border-stone bg-cream p-5 flex flex-col justify-between">
                <div>
                  <span className="loom-label text-[10px] uppercase text-ink-muted">01 · Understated Daily</span>
                  <h4 className="loom-display mt-1 text-xl text-ink">The Stealth Luxury</h4>
                  <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink-muted">
                    The Everyday Edit × Minimal (1/5). Tonal micro-motifs on heavyweight cotton tees or poplins. Noticed only at arm’s length.
                  </p>
                </div>
                <Link
                  to="/shop?edit=everyday&expression=minimal"
                  onClick={() => {
                    setEdit('everyday');
                    setExpressionSlug('minimal' as any);
                  }}
                  className="mt-5 inline-flex items-center gap-1 font-sans text-[12px] font-medium text-ink underline underline-offset-4 hover:text-accent"
                >
                  Explore Stealth Looks →
                </Link>
              </div>

              {/* Scenario 2 */}
              <div className="border border-stone bg-cream p-5 flex flex-col justify-between">
                <div>
                  <span className="loom-label text-[10px] uppercase text-ink-muted">02 · Festive Presence</span>
                  <h4 className="loom-display mt-1 text-xl text-ink">The Darbar Heirloom</h4>
                  <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink-muted">
                    The Festive Edit × Cult (3/5). Balanced heraldic compositions and gold-zari highlights tailored for family celebrations.
                  </p>
                </div>
                <Link
                  to="/shop?edit=festive-gifting&expression=cult"
                  onClick={() => {
                    setEdit('festive-gifting');
                    setExpressionSlug('cult' as any);
                  }}
                  className="mt-5 inline-flex items-center gap-1 font-sans text-[12px] font-medium text-ink underline underline-offset-4 hover:text-accent"
                >
                  Explore Festive Looks →
                </Link>
              </div>

              {/* Scenario 3 */}
              <div className="border border-stone bg-cream p-5 flex flex-col justify-between">
                <div>
                  <span className="loom-label text-[10px] uppercase text-ink-muted">03 · Center Stage</span>
                  <h4 className="loom-display mt-1 text-xl text-ink">The Collector Piece</h4>
                  <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink-muted">
                    The Statement Edit × Maximalist (5/5). Dense procession-scale embroidery across the back panel. The piece you plan the entire outfit around.
                  </p>
                </div>
                <Link
                  to="/shop?edit=statement&expression=maximalist"
                  onClick={() => {
                    setEdit('statement');
                    setExpressionSlug('maximalist' as any);
                  }}
                  className="mt-5 inline-flex items-center gap-1 font-sans text-[12px] font-medium text-ink underline underline-offset-4 hover:text-accent"
                >
                  Explore Statement Looks →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const Styles = Expressions;
