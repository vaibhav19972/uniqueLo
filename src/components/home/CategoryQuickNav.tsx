import React from 'react';
import { Link } from 'react-router';

interface QuickCategory {
  id: string;
  label: string;
  link: string;
  image: string;
}

const CATEGORIES: QuickCategory[] = [
  {
    id: 'women',
    label: 'WOMEN',
    link: '/shop?gender=women',
    image: '/images/campaigns/hero-animeverse.jpg',
  },
  {
    id: 'men',
    label: 'MEN',
    link: '/shop?gender=men',
    image: '/images/campaigns/hero-itihaas.jpg',
  },
  {
    id: 'tops',
    label: 'TOPS',
    link: '/shop?category=tops',
    image: '/images/categories/tops.jpg',
  },
  {
    id: 'bottoms',
    label: 'BOTTOMS',
    link: '/shop?category=bottoms',
    image: '/images/categories/bottoms.jpg',
  },
  {
    id: 'hoodies',
    label: 'HOODIES',
    link: '/shop?garment=hoodie',
    image: '/images/garments/hoodie.jpg',
  },
  {
    id: 'tees',
    label: 'TEES',
    link: '/shop?garment=tee',
    image: '/images/garments/tee.jpg',
  },
  {
    id: 'outerwear',
    label: 'OUTERWEAR',
    link: '/shop?category=outerwear',
    image: '/images/categories/outerwear.jpg',
  },
  {
    id: 'knitwear',
    label: 'KNITWEAR',
    link: '/shop?category=knitwear',
    image: '/images/categories/knitwear.jpg',
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    link: '/shop?category=accessories',
    image: '/images/categories/accessories.jpg',
  },
];

export const CategoryQuickNav: React.FC = () => {
  return (
    <nav
      aria-label="Category Navigation Rail"
      className="w-full border-b border-neutral-100 bg-white py-3 sm:py-4"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="no-scrollbar flex items-center gap-4 overflow-x-auto scroll-smooth py-1 snap-x snap-mandatory">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="group flex flex-col items-center gap-1.5 shrink-0 snap-start focus:outline-hidden"
              style={{ minWidth: '68px', minHeight: '84px' }}
            >
              {/* Circular Avatar Ring */}
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 p-0.5 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:border-black group-active:scale-95 sm:h-[70px] sm:w-[70px]">
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  className="h-full w-full rounded-full object-cover object-center"
                />
              </div>

              {/* Category Label */}
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-800 transition-colors group-hover:text-black">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
