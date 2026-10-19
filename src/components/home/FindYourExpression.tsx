import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import {
  EXPRESSION_LEVELS,
  getExpressionScore,
  type Product,
} from '../../lib/data';
import { MarketingHeader } from '../ui/MarketingHeader';

export const FindYourExpression: React.FC = () => {
  const { data: products } = useProducts();
  const [selectedScore, setSelectedScore] = useState<number>(3); // Default to artistic midpoint

  // Aggregate counts & sample products for each level
  const levelData = useMemo(() => {
    return EXPRESSION_LEVELS.map((level) => {
      const matching = (products ?? []).filter(
        (p) => getExpressionScore(p) === level.score
      );
      const sample = matching[0] as Product | undefined;
      return {
        level,
        count: matching.length,
        sampleProduct: sample,
        sampleImage:
          sample?.images[1]?.src ||
          sample?.images[0]?.src ||
          '/images/campaigns/atelier-craft.jpg',
      };
    });
  }, [products]);

  const activeLevel =
    levelData.find((d) => d.level.score === selectedScore) || levelData[2];

  return (
    <section
      aria-labelledby="expression-gateway-heading"
      className="bg-cream py-16 lg:py-24 border-b border-stone/50 overflow-hidden"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="The Signature Discovery Axis"
          title="Find Your Expression"
          titleId="expression-gateway-heading"
          sub="How loud do you want your clothing to speak? From whisper-quiet micro-stitch to museum-grade tapestry coats."
          linkTo="/expression"
          linkLabel="Explore all 5 levels"
        />

        {/* Level 1-to-5 Interactive Visual Selector Rail */}
        <div className="mt-8 mb-10 bg-paper border border-stone/60 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone/30">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-accent font-semibold block">
                Intensity Spectrum Selector
              </span>
              <p className="font-serif text-lg text-ink mt-0.5">
                Select your desired level of visual presence
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] text-ink-muted uppercase tracking-wider">
                Active Tier:
              </span>
              <span className="px-2.5 py-1 bg-cream border border-stone/80 font-serif text-xs font-semibold text-accent">
                Level {activeLevel.level.score} / 5 · {activeLevel.level.name}
              </span>
            </div>
          </div>

          {/* 5-Step Segmented Bar */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-5">
            {levelData.map(({ level, count }) => {
              const isSelected = level.score === selectedScore;
              return (
                <button
                  key={level.score}
                  type="button"
                  onClick={() => setSelectedScore(level.score)}
                  aria-pressed={isSelected}
                  className={`group relative text-left p-3 sm:p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-ink bg-ink text-cream shadow-md -translate-y-0.5'
                      : 'border-stone/60 bg-paper hover:border-accent hover:bg-cream/40 text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-gold-zari' : 'text-accent'
                      }`}
                    >
                      0{level.score}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-widest font-sans ${
                        isSelected ? 'text-cream/70' : 'text-ink-muted'
                      }`}
                    >
                      {count} {count === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>
                  <h4
                    className={`font-serif text-xs sm:text-sm font-semibold mt-2 truncate ${
                      isSelected ? 'text-cream' : 'text-ink'
                    }`}
                  >
                    {level.name}
                  </h4>
                  <div className="mt-2.5 w-full bg-stone/30 h-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSelected ? 'bg-accent' : 'bg-stone/60 group-hover:bg-accent/70'
                      }`}
                      style={{ width: `${level.score * 20}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Visual Expression Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          {levelData.map(({ level, count, sampleProduct, sampleImage }) => {
            const isSelected = level.score === selectedScore;
            return (
              <article
                key={level.score}
                className={`group flex flex-col bg-paper border transition-all duration-300 relative ${
                  isSelected
                    ? 'border-ink ring-2 ring-ink/80 shadow-md'
                    : 'border-stone/60 hover:border-accent hover:shadow-sm'
                }`}
              >
                {/* Visual Imagery / Macro Detail */}
                <div className="aspect-[4/5] bg-stone/20 overflow-hidden relative border-b border-stone/30">
                  <img
                    src={sampleImage}
                    alt={`${level.name} embroidery detail`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  
                  {/* Top Level Pill */}
                  <div className="absolute top-3 left-3 bg-paper/95 text-ink text-[9px] uppercase tracking-widest font-sans font-semibold px-2 py-0.5 border border-stone/60">
                    Level {level.score}
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 inset-x-3 text-cream">
                    <span className="text-[10px] uppercase font-sans tracking-widest text-gold-zari font-semibold block">
                      {level.characteristics.split(',')[0]}
                    </span>
                    <h3 className="font-serif text-lg leading-tight mt-0.5">
                      {level.name}
                    </h3>
                  </div>
                </div>

                {/* Card Editorial Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[11px] text-ink-muted leading-relaxed font-light line-clamp-3">
                      {level.description}
                    </p>
                    {sampleProduct && (
                      <div className="mt-3 pt-2.5 border-t border-stone/30 text-[10px] text-ink-muted">
                        <span className="uppercase tracking-widest text-ink/70 block">
                          Featured in this tier:
                        </span>
                        <span className="font-serif text-ink font-medium truncate block mt-0.5">
                          {sampleProduct.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      to={`/expression/${level.slug}`}
                      className={`w-full py-2 px-3 text-center text-[10px] uppercase tracking-widest font-semibold transition-colors block ${
                        isSelected
                          ? 'bg-accent text-cream hover:bg-accent-hover'
                          : 'bg-cream text-ink border border-stone/60 hover:bg-ink hover:text-cream hover:border-ink'
                      }`}
                    >
                      Shop Tier ({count}) →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Philosophy Footnote */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-muted gap-2 pt-4 border-t border-stone/40">
          <p className="font-serif italic">
            "Your level of expression should reflect your mood, the setting, and how much of your story you want the world to see."
          </p>
          <Link
            to="/expression"
            className="text-accent uppercase tracking-widest text-[10px] font-semibold hover:underline shrink-0"
          >
            Read the Atelier Expression Manifesto →
          </Link>
        </div>
      </div>
    </section>
  );
};
