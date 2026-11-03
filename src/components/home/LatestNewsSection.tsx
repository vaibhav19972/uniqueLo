import React from 'react';
import { Link } from 'react-router';

interface Article {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

const ARTICLES: Article[] = [
  {
    id: 'culture-corner',
    date: 'OCTOBER 24, 2026',
    title: 'Introducing Culture Corner: Indian Heritage With A Streetwear Twist',
    excerpt: 'How historical embroidery techniques and ancient temple architecture inspired our new oversized heavyweight collection.',
    image: '/images/campaigns/hero-itihaas.jpg',
    slug: '/our-craft',
  },
  {
    id: 'winter-fashion',
    date: 'OCTOBER 22, 2026',
    title: 'Men’s Winter Fashion: Better Layers, Better Fits & 400 GSM Fleece',
    excerpt: 'The complete guide to layering with acid wash zip hoodies, parachute pants, and textured overshirts.',
    image: '/images/campaigns/lookbook-01.jpg',
    slug: '/shop?category=outerwear',
  },
  {
    id: 'anime-culture',
    date: 'OCTOBER 05, 2026',
    title: 'Anime & Streetwear: How Fandom Culture Reshaped Indian Fashion',
    excerpt: 'Behind the stitches of our Animeverse drop: converting iconic character silhouettes into wearable art.',
    image: '/images/campaigns/hero-animeverse.jpg',
    slug: '/shop?universe=animeverse',
  },
];

export const LatestNewsSection: React.FC = () => {
  return (
    <section aria-label="Latest News in Fashion" className="w-full bg-[#FAFAFA] py-8 md:py-14 border-t border-[#EDEDED]">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 md:text-2xl">
              Latest News
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 md:text-sm">
              Hot off the press: All the latest news in fashion
            </p>
          </div>

          <Link
            to="/our-craft"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-red-600"
          >
            View all posts →
          </Link>
        </div>

        {/* Blog Cards Container (Snap-scroll on mobile, 3-col on desktop) */}
        <div
          className="no-scrollbar flex w-full overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="w-[82vw] shrink-0 sm:w-[60vw] md:w-auto overflow-hidden rounded-lg bg-white border border-neutral-200 shadow-xs flex flex-col"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {article.date}
                </span>

                <h3 className="mt-1.5 text-sm font-bold text-neutral-900 line-clamp-2 hover:text-red-600 transition-colors">
                  <Link to={article.slug}>{article.title}</Link>
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-neutral-600 line-clamp-2 font-normal">
                  {article.excerpt}
                </p>

                <div className="mt-4 pt-2 border-t border-neutral-100">
                  <Link
                    to={article.slug}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-black hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
