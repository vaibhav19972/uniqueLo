import React from 'react';
import { motion } from 'motion/react';
import { useCategories } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';

export const CategoryTabs: React.FC = () => {
  const { data: categories } = useCategories();
  const activeCategory = useFiltersStore((state) => state.filters.categorySlug);
  const setCategory = useFiltersStore((state) => state.setCategory);

  return (
    <div className="w-full overflow-x-auto border-b border-neutral-200 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex min-w-max max-w-7xl gap-6 px-4 sm:gap-8 sm:px-6 lg:px-8">
        {(categories ?? []).map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`relative min-h-[46px] cursor-pointer py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-black' : 'text-neutral-500 hover:text-black'
              }`}
            >
              {cat.label}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
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
