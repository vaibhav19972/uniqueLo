import React from 'react';
import { useParams, Link } from 'react-router';
import { useCraftTechnique, useProducts } from '../hooks/useCatalog';
import { ProductCard } from '../components/shop/ProductCard';
import { Button } from '../components/ui/Button';

export const AtelierTechnique: React.FC = () => {
  const { techniqueSlug } = useParams<{ techniqueSlug: string }>();
  const { data: craft, isPending } = useCraftTechnique(techniqueSlug);
  const { data: products } = useProducts();

  const matchingProducts = (products || []).filter(
    (p) => p.embroidery?.technique === techniqueSlug || p.tags.includes(techniqueSlug || '')
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-serif text-xl text-ink">Consulting Craft Guild Archives...</p>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl text-ink">Craft Technique Not Found</h2>
        <Link to="/atelier" className="mt-4">
          <Button variant="primary">Return to Craft Taxonomy</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      {/* Header Banner */}
      <section className="pt-16 pb-12 bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center text-xs tracking-wider uppercase font-sans text-ink-muted mb-4">
            <Link to="/atelier" className="hover:text-ink">Atelier</Link>
            <span className="mx-2">/</span>
            <span className="text-accent font-medium">{craft.region}</span>
          </div>

          <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
            Regional Guild // {craft.cluster}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-ink font-normal mt-2 tracking-tight">
            {craft.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-3xl mt-4 font-light leading-relaxed">
            {craft.description}
          </p>
        </div>
      </section>

      {/* Narrative & Process Grid */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Origin Essay */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-paper border border-stone">
              <span className="text-[10px] uppercase tracking-widest text-accent font-medium block mb-2">
                Historical Context & Provenance
              </span>
              <h3 className="font-serif text-2xl text-ink font-normal">
                Generations of Needle Tension
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted font-light mt-3 leading-relaxed">
                {craft.historicalContext}
              </p>
            </div>

            <div className="p-6 bg-paper border border-stone space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-stone/50">
                <span className="text-ink-muted uppercase tracking-wider text-[10px]">Stitch Mechanism</span>
                <span className="font-medium text-ink">{craft.stitchType}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-stone/50">
                <span className="text-ink-muted uppercase tracking-wider text-[10px]">Pace of Work</span>
                <span className="font-medium text-ink">{craft.artisanPace}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted uppercase tracking-wider text-[10px]">Regional Cluster</span>
                <span className="font-medium text-ink">{craft.region}</span>
              </div>
            </div>
          </div>

          {/* Right: Craft Process Steps */}
          <div className="lg:col-span-7">
            <span className="text-[10px] uppercase tracking-widest text-ink-muted font-medium block mb-4">
              The Four Atelier Phases
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-paper border border-stone">
                <span className="font-sans text-xs text-accent font-medium">Phase 01</span>
                <h4 className="font-serif text-lg text-ink mt-1">Grid & Pattern Pinning</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">
                  Natural mineral chalk lines are drafted onto garment panels prior to tailoring assembly to ensure stitches align across seams.
                </p>
              </div>

              <div className="p-5 bg-paper border border-stone">
                <span className="font-sans text-xs text-accent font-medium">Phase 02</span>
                <h4 className="font-serif text-lg text-ink mt-1">Wooden Frame Tension</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">
                  Fabrics are mounted on hand-lathed timber frames (Khaat) to maintain drum-tight surface tension while fine needle hooks penetrate the grain.
                </p>
              </div>

              <div className="p-5 bg-paper border border-stone">
                <span className="font-sans text-xs text-accent font-medium">Phase 03</span>
                <h4 className="font-serif text-lg text-ink mt-1">Needle Anchoring</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">
                  Master artisans feed pure silk floss or metallic wires loop by loop, calibrating stitch density to avoid textile distortion.
                </p>
              </div>

              <div className="p-5 bg-paper border border-stone">
                <span className="font-sans text-xs text-accent font-medium">Phase 04</span>
                <h4 className="font-serif text-lg text-ink mt-1">Inspection & Soft Wash</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">
                  Finished needlecraft is washed in gentle well water and air-cured, settling the thread tension into its permanent heirloom structure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Garments from this Guild */}
        <div className="mt-20 pt-12 border-t border-stone/60">
          <div className="mb-8">
            <span className="text-[10px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
              Permanent Edit
            </span>
            <h2 className="font-serif text-3xl text-ink mt-1">
              Garments Embroidered in {craft.name}
            </h2>
          </div>

          {matchingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {matchingProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">
              Current editions in this craft are undergoing seasonal atelier wash and will release shortly.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
