import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getFeaturedProducts, formatPrice, getDefaultVariant, type Product } from '../../lib/data';
import { prefersReducedMotion } from '../../lib/motion';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedProducts: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const featured = useMemo(() => getFeaturedProducts(6), []);

  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current || !containerRef.current) return;

      const track = trackRef.current;
      const scrollWidth = track.scrollWidth - window.innerWidth + 120;

      if (scrollWidth <= 0) return;

      gsap.to(track, {
        x: () => -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: containerRef, dependencies: [featured] }
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-paper text-ink overflow-hidden border-b border-stone/50"
    >
      <div className="py-20 lg:py-24">
        {/* Header */}
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 text-accent text-[11px] font-sans tracking-[0.25em] uppercase font-medium">
              <span>✦</span>
              <span>Limited Atelier Run</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-ink mt-2">
              Featured Needlecraft
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted max-w-sm mt-3 sm:mt-0 font-light">
            Each silhouette features hand-guided stitchwork, unbleached organic backings, 
            and authenticated artisan hours.
          </p>
        </div>

        {/* Scroll Track */}
        <div
          ref={trackRef}
          className="flex gap-6 sm:gap-8 px-4 sm:px-6 lg:px-12 w-max will-change-transform"
        >
          {featured.map((product: Product) => {
            const defaultVariant = getDefaultVariant(product);
            const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
            const macroImage = product.images[1]?.src || frontImage;

            return (
              <div
                key={product.slug}
                className="w-[280px] sm:w-[360px] lg:w-[400px] flex-shrink-0 group flex flex-col bg-cream border border-stone/60"
              >
                {/* Image Container with Macro Swap on Hover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                  {/* Default Image */}
                  <Image
                    src={frontImage}
                    alt={product.images[0]?.alt || product.name}
                    aspectRatio="3/4"
                    className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {/* Macro Hover Image */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Image
                      src={macroImage}
                      alt={product.images[1]?.alt || `${product.name} Macro Detail`}
                      aspectRatio="3/4"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-ink/80 text-cream backdrop-blur-md px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono">
                      3x Macro Stitch
                    </div>
                  </div>

                  {/* Craft Technique Tag */}
                  {product.embroidery && (
                    <div className="absolute bottom-3 left-3 bg-cream/90 text-ink backdrop-blur-md px-2.5 py-1 text-[10px] tracking-widest uppercase border border-stone/80">
                      {product.embroidery.techniqueLabel}
                    </div>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-t from-ink/80 to-transparent flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-[10px] tracking-widest"
                      onClick={() => addItem(product.slug, defaultVariant.sku, 1)}
                    >
                      Quick Add
                    </Button>

                    {product.customizable && (
                      <Button
                        variant="accent"
                        size="sm"
                        className="text-[10px] tracking-widest px-3"
                        title="Bespoke Monogram Studio"
                        onClick={() => openCustomizer(product)}
                      >
                        Bespoke
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link to="/shop">
                        <h3 className="font-serif text-lg text-ink font-medium leading-snug group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <span className="font-sans text-sm font-medium text-ink whitespace-nowrap">
                        {formatPrice(defaultVariant.priceCents)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1.5 font-light line-clamp-2">
                      {product.subtitle}
                    </p>
                  </div>

                  {product.embroidery?.artisanHours && (
                    <div className="mt-4 pt-3 border-t border-stone/50 flex justify-between items-center text-[10px] text-ink-muted uppercase tracking-wider">
                      <span>Artisan Labor</span>
                      <span className="font-medium text-ink">
                        {product.embroidery.artisanHours} Hours Hand-Needle
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
