import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import {
  EXPRESSION_LEVELS,
  getExpressionScore,
  type Product,
} from '../../lib/data';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

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
        // Curated placeholder art per expression level — a taxonomy card, so
        // the artwork must not churn with the catalogue.
        sampleImage: `/images/expression/${level.slug}.jpg`,
      };
    });
  }, [products]);

  return (
    <section ref={revealRef} className="reveal bg-cream py-16 lg:py-16 border-b border-stone/50 overflow-hidden"       aria-labelledby="expression-gateway-heading"
      
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
                className={`group relative flex cursor-pointer select-none flex-col overflow-hidden border bg-paper text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? '-translate-y-1 border-accent ring-2 ring-accent shadow-lg'
                    : 'border-stone hover:-translate-y-0.5 hover:border-accent hover:shadow-md'
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
                  <div className="scrim-bottom absolute inset-x-0 bottom-0 h-2/3" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
                  
                  {/* Active Selection Badge (replaces Level pill) */}
                  {isSelected && (
                    <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 border border-accent-border bg-paper/95 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-widest text-accent shadow-sm animate-fadeIn">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      Active
                    </div>
                  )}

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 inset-x-3 z-10 text-ink">
                    <span className="block font-sans text-[10px] font-semibold uppercase tracking-widest text-accent">
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
                    <p className="line-clamp-3 font-sans text-[11px] leading-relaxed text-ink-muted">
                      {level.description}
                    </p>
                    {sampleProduct && (
                      <div className="mt-3 pt-2.5 border-t border-stone/30 text-[10px] text-ink-muted">
                        <span className="block uppercase tracking-widest text-ink-muted">
                          Featured in this style:
                        </span>
                        <span className="mt-0.5 block truncate font-sans font-medium text-ink">
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
                      className={`w-full py-2 px-3 text-center text-[10px] uppercase tracking-widest font-semibold transition-colors block ${
                        isSelected
                          ? 'bg-accent text-on-accent hover:bg-accent-hover'
                          : 'border border-stone-strong bg-paper text-ink hover:border-ink'
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
          <p className="font-sans text-xs italic">
            "Your embroidery style should reflect your mood, the setting, and how much of your story you want the world to see."
          </p>
          <Link
            to="/styles"
            className="text-accent uppercase tracking-widest text-[10px] font-semibold hover:underline shrink-0"
          >
            Read the Atelier Style Guide →
          </Link>
        </div>
      </div>
    </section>
  );
};
