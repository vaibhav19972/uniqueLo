import React from 'react';
import { Link } from 'react-router';
import { useCraftTechniques, useProducts } from '../hooks/useCatalog';
import { SectionHeader } from '../components/ui/SectionHeader';

export const Atelier: React.FC = () => {
  const { data: techniques } = useCraftTechniques();
  const { data: products } = useProducts();

  return (
    <div className="bg-cream min-h-screen">
      {/* Editorial Hero Header */}
      <section className="pt-16 pb-12 bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            archetype="statement"
            title="The Indian Craft Taxonomy"
            subtitle="Embroidery is not ceremony—it belongs on the essentials you live in. We work with specialized artisan guilds from Jaipur to Lucknow, translating centuries of hand-needle heritage into modern silhouettes built for daily wear."
          />

          <div className="flex flex-wrap items-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              6 Verifiable Craft Guilds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              14 to 34 Hand Needle Hours Per Piece
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              100% Natural Yarns (Mulberry Silk, Zari, Ringspun Cotton)
            </span>
          </div>
        </div>
      </section>

      {/* Craft Taxonomy Rows */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 divide-y divide-stone/60">
        {(techniques || []).map((craft, idx) => {
          const linkedCount = (products || []).filter(
            (p) => p.embroidery?.technique === craft.slug || p.tags.includes(craft.slug)
          ).length;

          return (
            <div
              key={craft.slug}
              className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group"
            >
              {/* Numeral & Identity */}
              <div className="lg:col-span-4">
                <span className="font-sans text-xs font-medium tracking-[0.25em] text-ink-muted uppercase block">
                  0{idx + 1} // {craft.region}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-ink font-normal mt-1 group-hover:text-accent transition-colors">
                  {craft.name}
                </h3>
                <p className="text-xs font-sans text-accent font-medium mt-1">
                  {craft.cluster} • {craft.artisanPace}
                </p>

                <p className="text-xs sm:text-sm text-ink-muted font-light mt-4 leading-relaxed">
                  {craft.historicalContext}
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <Link
                    to={`/atelier/${craft.slug}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink hover:text-accent font-medium transition-colors"
                  >
                    <span>Inspect Craft Process</span>
                    <span>→</span>
                  </Link>

                  <Link
                    to="/shop"
                    className="text-xs text-ink-muted hover:text-ink font-light underline underline-offset-4"
                  >
                    View Available Garments ({linkedCount})
                  </Link>
                </div>
              </div>

              {/* Texture Hero Imagery */}
              <div className="lg:col-span-8">
                <Link
                  to={`/atelier/${craft.slug}`}
                  className="block relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-stone/20 border border-stone shadow-sm group-hover:shadow-lg transition-shadow"
                >
                  <img
                    src={craft.image}
                    alt={craft.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-cream">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-cream/80 block">
                        Stitch Architecture
                      </span>
                      <span className="font-serif text-lg text-cream">
                        {craft.stitchType}
                      </span>
                    </div>

                    <span className="text-[11px] font-sans tracking-widest uppercase bg-cream/90 text-ink px-3 py-1 font-medium">
                      Explore Guild →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
