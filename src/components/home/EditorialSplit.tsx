import React from 'react';
import { Link } from 'react-router';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

export const EditorialSplit: React.FC = () => {
  return (
    <section
      id="editorial-manifesto"
      className="py-24 lg:py-32 bg-cream border-b border-stone/50 overflow-hidden"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Editorial Imagery Pair */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 w-4/5 ml-auto border border-stone/80 shadow-lg">
              <Image
                src="/images/campaigns/editorial-split.jpg"
                alt="Artisan needleworker crafting botanical chain stitches"
                aspectRatio="4/5"
                className="w-full object-cover"
              />
            </div>
            {/* Secondary overlapping frame */}
            <div className="absolute top-1/4 left-0 z-20 w-3/5 border border-stone/80 shadow-2xl bg-paper p-3 hidden sm:block">
              <Image
                src="/images/campaigns/atelier-craft.jpg"
                alt="Macro metallic zari thread tension and bullion wire detail"
                aspectRatio="1/1"
                className="w-full object-cover"
              />
              <div className="p-2 text-center">
                <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-mono">
                  Master Zardozi Needlecraft
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Atelier Craft Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
              <span>✦</span>
              <span>The Atelier Manifesto</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.08] tracking-tight">
              Honoring the Tension of the Hand-Drawn Thread.
            </h2>

            <p className="text-base text-ink-muted leading-relaxed font-light">
              In an era dominated by synthetic fast-fashion and flat digital prints, UniqueLo 
              champions the tactile dignity of real needlecraft. Every motif on our garments 
              is drafted by hand, transferred through chalk pounce stencils, and embroidered 
              by hereditary craftspeople.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone/60">
              <div>
                <h4 className="font-serif text-lg text-ink font-medium">
                  Mulberry Silk & Zari
                </h4>
                <p className="text-xs text-ink-muted mt-1 leading-normal font-light">
                  Spun from natural silkworm fibers and pure metallic wire cores, our threads catch ambient light with iridescent lustre.
                </p>
              </div>

              <div>
                <h4 className="font-serif text-lg text-ink font-medium">
                  Zero Synthetic Backing
                </h4>
                <p className="text-xs text-ink-muted mt-1 leading-normal font-light">
                  We reject scratchy polyester stabilizers. Every embroidery reverse is lined with unbleached organic muslin or silk batiste.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link to="/shop">
                <Button variant="primary" size="md" className="text-xs tracking-[0.2em]">
                  Explore Bespoke Creations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
