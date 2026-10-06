import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { getCategories } from '../../lib/data';
import { useFiltersStore } from '../../stores/filters';

export const CategoryTabs: React.FC = () => {
  const categories = useMemo(() => getCategories(), []);
  const activeCategory = useFiltersStore((state) => state.filters.categorySlug);
  const setCategory = useFiltersStore((state) => state.setCategory);

  return (
    <div className="w-full border-b border-stone/60 overflow-x-auto scrollbar-none bg-paper">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 flex space-x-8 sm:space-x-12 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`relative py-4 text-xs sm:text-sm font-sans uppercase tracking-[0.2em] transition-colors cursor-pointer focus-visible:outline-accent font-medium ${
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {cat.label}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
