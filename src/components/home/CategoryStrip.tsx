import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCategories } from '../../hooks/useCatalog';
import { Image } from '../ui/Image';
import { useFiltersStore } from '../../stores/filters';

export const CategoryStrip: React.FC = () => {
  const { data: categories } = useCategories();
  const visibleCategories = useMemo(() => {
    return (categories ?? []).filter((c) => c.slug !== 'all');
  }, [categories]);

  const setCategory = useFiltersStore((state) => state.setCategory);

  return (
    <section className="py-20 bg-cream border-b border-stone/50">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone/40">
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
              Curated Wardrobe
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-1">
              Atelier Collections
            </h2>
          </div>
          <Link
            to="/shop"
            onClick={() => setCategory('all')}
            className="text-xs font-sans tracking-widest uppercase text-ink hover:text-accent transition-colors mt-3 sm:mt-0 font-medium inline-flex items-center gap-1.5"
          >
            <span>View All Collections</span>
            <span>→</span>
          </Link>
        </div>

        {/* Categories Strip */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pb-4 sm:pb-0 scrollbar-none snap-x">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.slug}
              to="/shop"
              onClick={() => setCategory(cat.slug)}
              className="flex-shrink-0 w-64 sm:w-auto group block snap-start focus-visible:outline-accent"
            >
              <div className="relative overflow-hidden bg-stone aspect-[4/5] border border-stone/60 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:border-ink/50 group-hover:-translate-y-1">
                {/* Decorative Needlework Stitch Border Template Overlay */}
                <div className="absolute inset-2 border border-dashed border-cream/40 z-10 pointer-events-none group-hover:border-accent/70 transition-colors" />

                <Image
                  src={cat.image || '/images/placeholders/hero.jpg'}
                  alt={cat.name}
                  aspectRatio="4/5"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                />
                
                {/* Subtle Gradient & Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Floating Tag */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-cream/90 text-ink text-[9px] uppercase tracking-widest px-2 py-0.5 backdrop-blur-xs font-medium border border-stone/60">
                    Ed. 0{cat.order}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-cream z-20">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-medium block mb-0.5">
                    Atelier Edition
                  </span>
                  <h3 className="font-serif text-xl text-cream leading-tight group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone/80 font-light line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-cream uppercase tracking-widest font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore Wardrobe</span>
                    <span className="text-accent">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};