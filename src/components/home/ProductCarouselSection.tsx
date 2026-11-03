import React, { useRef } from 'react';
import { Link } from 'react-router';
import type { Product } from '../../lib/data';
import { ProductCardMobile } from '../shop/ProductCardMobile';

interface ProductCarouselSectionProps {
  title: string;
  subtitle: string;
  viewAllLink: string;
  viewAllText?: string;
  products: Product[];
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View all',
  products,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-white py-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Section Header */}
        <div className="flex items-end justify-between px-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 md:text-2xl">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 md:text-sm">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={viewAllLink}
              className="inline-flex min-h-[44px] items-center text-xs font-bold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-red-600"
            >
              {viewAllText}
            </Link>

            {/* Desktop Navigation Chevrons */}
            <div className="hidden md:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label={`Scroll ${title} left`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label={`Scroll ${title} right`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 2.15-Card CSS Scroll-Snap Horizontal Track */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full overflow-x-auto scroll-smooth px-4 gap-3 md:gap-5"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product) => (
            <div
              key={product.slug}
              className="w-[calc((100vw-48px)/2.15)] min-w-[150px] max-w-[210px] shrink-0 md:w-[calc((100%-60px)/4)] md:max-w-none"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCardMobile product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
