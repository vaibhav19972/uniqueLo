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
              <div className="relative overflow-hidden bg-stone aspect-[4/5] border border-stone/60">
                <Image
                  src={cat.image || '/images/placeholders/hero.jpg'}
                  alt={cat.name}
                  aspectRatio="4/5"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-cream">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-stone/80">
                    Category 0{cat.order}
                  </span>
                  <h3 className="font-serif text-lg text-cream leading-tight group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone/70 font-light line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};