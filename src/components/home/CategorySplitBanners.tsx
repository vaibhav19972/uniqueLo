import React from 'react';
import { Link } from 'react-router';

interface SplitBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  link: string;
  image: string;
}

const BANNERS: SplitBanner[] = [
  {
    id: 'mens',
    title: 'SHOP MENS',
    subtitle: 'Oversized Tees & Hoodies',
    ctaText: 'EXPLORE',
    link: '/shop?gender=men',
    image: '/images/campaigns/hero-itihaas.jpg',
  },
  {
    id: 'womens',
    title: 'SHOP WOMENS',
    subtitle: 'Co-ords & Statement Pieces',
    ctaText: 'EXPLORE',
    link: '/shop?gender=women',
    image: '/images/campaigns/hero-animeverse.jpg',
  },
  {
    id: 'new-in',
    title: 'EXPLORE NEW IN',
    subtitle: 'Limited Fandom & Cultural Drops',
    ctaText: 'SHOP NOW',
    link: '/shop?sort=newest',
    image: '/images/campaigns/hero-heroverse.jpg',
  },
];

export const CategorySplitBanners: React.FC = () => {
  return (
    <section aria-label="Gender Split Categories" className="w-full bg-white py-3 sm:py-6">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        {/* Mobile: 2-column side-by-side split + 1 full-width drop; Desktop: 3-column grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          {BANNERS.map((banner, idx) => (
            <Link
              key={banner.id}
              to={banner.link}
              className={`group relative block w-full overflow-hidden rounded-xl bg-neutral-900 shadow-2xs transition-transform hover:shadow-md ${
                idx === 2
                  ? 'col-span-2 aspect-[21/9] sm:aspect-[24/9] md:col-span-1 md:aspect-[3/4]'
                  : 'aspect-[4/5] md:aspect-[3/4]'
              }`}
            >
              {/* Background Photo with zoom on hover */}
              <img
                src={banner.image}
                alt={banner.title}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:opacity-90" />

              {/* Content Box */}
              <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-5 text-center text-white">
                <h3 className="font-display text-sm sm:text-lg md:text-xl font-black uppercase tracking-tight text-white drop-shadow-md">
                  {banner.title}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[10px] sm:text-xs font-medium text-white/80">
                  {banner.subtitle}
                </p>

                <div className="mt-2 flex justify-center">
                  <span className="inline-flex min-h-[32px] sm:min-h-[36px] items-center justify-center rounded-full bg-white px-4 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black shadow-xs transition-colors group-hover:bg-neutral-100">
                    {banner.ctaText}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
