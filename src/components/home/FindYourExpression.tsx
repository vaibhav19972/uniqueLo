import React, { useState, useMemo } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import {
  EXPRESSION_LEVELS,
  getExpressionScore,
  type Product,
} from '../../lib/data';
import { MarketingHeader } from '../ui/MarketingHeader';

export const FindYourExpression: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();

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
          sample?.images[0]?.src ||
          sample?.images[1]?.src ||
          '/images/campaigns/atelier-craft.jpg',
      };
    });
  }, [products]);

  return (
    <section
      ref={revealRef}
      aria-labelledby="expression-gateway-heading"
      className="reveal bg-cream py-16 lg:py-24 border-b border-stone/50 overflow-hidden"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="The Signature Discovery Axis"
          title="Find Your Style"
          titleId="expression-gateway-heading"
          sub="How loud do you want your clothing to speak? From whisper-quiet micro-stitch to museum-grade tapestry coats."
          linkTo="/styles"
          linkLabel="Explore all 5 styles"
        />

        {/* 5 Visual Style Cards Grid — all five selectable */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {levelData.map(({ level, count, sampleProduct, sampleImage }) => {
            const isSelected = level.score === selectedScore;
            return (
              <article
                key={level.score}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedScore(level.score)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedScore(level.score);
                  }
                }}
                className={`group flex flex-col bg-paper border transition-all duration-300 relative cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-ink ring-2 ring-ink shadow-lg -translate-y-1'
                    : 'border-stone/60 hover:border-accent hover:shadow-md hover:-translate-y-0.5'
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Active Selection Badge (replaces Level pill) */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 bg-panel-raised/95 text-gold-zari text-xs uppercase tracking-widest font-sans font-semibold px-2 py-0.5 border border-gold-zari/40 shadow-sm flex items-center gap-1.5 animate-fadeIn">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-zari animate-pulse" />
                      Active
                    </div>
                  )}

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <span className="text-xs uppercase font-sans tracking-widest text-gold-zari font-semibold block">
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
                    <p className="text-xs text-ink-muted leading-relaxed font-light line-clamp-3">
                      {level.description}
                    </p>
                    {sampleProduct && (
                      <div className="mt-3 pt-2.5 border-t border-stone/30 text-xs text-ink-muted">
                        <span className="uppercase tracking-widest text-ink/70 block">
                          Featured in this style:
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
                      to={`/styles/${level.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full py-2 px-3 text-center text-xs uppercase tracking-widest font-semibold transition-colors block ${
                        isSelected
                          ? 'bg-accent text-white hover:bg-accent-hover'
                          : 'bg-transparent text-ink border border-stone-strong hover:border-ink'
                      }`}
                    >
                      Shop Style ({count}) →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Philosophy Footnote */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-muted gap-2 pt-4 border-t border-stone/40">
          <p className="font-serif">
            "Your embroidery style should reflect your mood, the setting, and how much of your story you want the world to see."
          </p>
          <Link
            to="/styles"
            className="text-accent uppercase tracking-widest text-xs font-semibold hover:underline shrink-0"
          >
            Read the Atelier Style Guide →
          </Link>
        </div>
      </div>
    </section>
  );
};
