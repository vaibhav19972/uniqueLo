import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

interface GarmentCardDef {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  fallbackImage: string;
}

const FEATURED_GARMENTS: GarmentCardDef[] = [
  {
    slug: 'hoodie',
    name: 'Hoodies',
    eyebrow: 'Heavyweight Fleece',
    description: '450 GSM organic loopback cotton carrying grand back-panel and crest reliefs.',
    fallbackImage: '/images/products/sakura-ronin-hoodie-1.jpg',
  },
  {
    slug: 'tee',
    name: 'Tees & Oversized',
    eyebrow: 'Combed Cotton',
    description: '280 GSM relaxed drop-shoulder silhouettes with high thread-count centerpieces.',
    fallbackImage: '/images/products/vine-heavyweight-tee-1.jpg',
  },
  {
    slug: 'jacket',
    name: 'Atelier Jackets',
    eyebrow: 'Structured Outerwear',
    description: 'Chore coats, bombers, and capes with procession-scale embroidery.',
    fallbackImage: '/images/products/kantha-chore-jacket-1.jpg',
  },
  {
    slug: 'shirt',
    name: 'Shirts & Tunics',
    eyebrow: 'Crisp Poplins',
    description: 'Oxfords, band-collars, and tunics featuring monogram and cuff threadwork.',
    fallbackImage: '/images/products/monogram-poplin-shirt-1.jpg',
  },
  {
    slug: 'cardigan',
    name: 'Knitwear & Cardigans',
    eyebrow: 'Fine Cashmere',
    description: 'Hand-linked knits with tactile crewel and French-knot textured motifs.',
    fallbackImage: '/images/products/crewel-cashmere-cardigan-1.jpg',
  },
  {
    slug: 'scarf',
    name: 'Silk Scarves & Accessories',
    eyebrow: 'Heirloom Accents',
    description: 'Pure Mulberry silk and canvas carriers with architectural border jaal.',
    fallbackImage: '/images/products/embroidered-silk-scarf-1.jpg',
  },
];

export const ShopByGarment: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: allProducts } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of allProducts ?? []) {
      if (p.garmentType) {
        c[p.garmentType] = (c[p.garmentType] ?? 0) + 1;
      }
    }
    return c;
  }, [allProducts]);

  return (
    <section ref={revealRef} className="reveal bg-cream py-16 lg:py-16 border-b border-stone/50 overflow-hidden"       aria-labelledby="garments-gateway-heading"
      
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Silhouettes & Cuts"
          title="Shop by Garment"
          titleId="garments-gateway-heading"
          sub="Know what you want to wear? Browse our master patterns and textile constructions."
          linkTo="/clothing"
          linkLabel="Explore all silhouettes"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 mt-6 sm:mt-10">
          {FEATURED_GARMENTS.map((item) => {
            const count = counts[item.slug] ?? 0;
            // Curated placeholder art per garment, never a live product photo —
            // the rail is a taxonomy door, so the artwork must stay stable as
            // the catalogue churns.
            const image = `/images/garments/${item.slug}.jpg`;

            return (
              <article
                key={item.slug}
                className="group relative flex flex-col overflow-hidden border border-stone bg-paper transition-all duration-300 hover:border-accent"
              >
                {/* Visual Imagery */}
                <div className="aspect-[4/3] bg-stone/20 overflow-hidden relative border-b border-stone/40">
                  <img
                    src={image}
                    alt={`${item.name} — placeholder campaign art`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.fallbackImage;
                    }}
                  />
                  {/* Canvas-keyed scrim: keeps the label legible on both modes
                      without turning a bright shot into grey fog. */}
                  <div className="scrim-bottom absolute inset-x-0 bottom-0 h-2/3" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />

                  {/* Eyebrow & Live Count Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-paper/95 text-ink text-[8px] sm:text-[9px] uppercase tracking-widest font-sans font-semibold px-1.5 sm:px-2.5 py-0.5 border border-stone/60">
                    {item.eyebrow}
                  </div>

                  <div className="absolute bottom-2 inset-x-2 z-10 sm:bottom-3 sm:inset-x-3 text-ink flex items-end justify-between gap-1">
                    <div>
                      <h3 className="font-serif text-sm sm:text-2xl leading-tight line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    <span className="shrink-0 border border-stone bg-paper/90 px-1.5 py-0.5 font-sans text-[9px] uppercase text-ink-muted sm:px-2 sm:text-xs">
                      {count} {count === 1 ? 'Design' : 'Designs'}
                    </span>
                  </div>
                </div>

                {/* Body & Link */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                  <p className="line-clamp-2 font-sans text-[11px] leading-relaxed text-ink-muted sm:text-xs">
                    {item.description}
                  </p>
                  
                  <div className="pt-2 border-t border-stone/30 flex items-center justify-between">
                    <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-accent font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                      Explore {item.name} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>

                {/* Stretched Link */}
                <Link
                  to={`/clothing/${item.slug}`}
                  aria-label={`Explore ${item.name} silhouette collection`}
                  className="absolute inset-0 focus-visible:outline focus-visible:outline-accent"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
