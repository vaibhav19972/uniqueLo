import React from 'react';
import { motion } from 'motion/react';
import { useCategories } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';

export const CategoryTabs: React.FC = () => {
  const { data: categories } = useCategories();
  const activeCategory = useFiltersStore((state) => state.filters.categorySlug);
  const setCategory = useFiltersStore((state) => state.setCategory);

  return (
    <div className="w-full overflow-x-auto border-b border-stone bg-cream [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex min-w-max max-w-[var(--container-max)] gap-6 px-4 sm:gap-9 sm:px-6 lg:px-12">
        {(categories ?? []).map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`relative min-h-[48px] cursor-pointer py-4 font-sans text-[11px] font-medium uppercase tracking-[0.16em] transition-colors focus-visible:outline-accent sm:text-[12px] ${
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {cat.label}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-ink"
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