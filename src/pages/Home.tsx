import React, { useMemo } from 'react';
import { useProducts } from '../hooks/useCatalog';
import { HeroBannerCarousel } from '../components/home/HeroBannerCarousel';
import { CategoryQuickNav } from '../components/home/CategoryQuickNav';
import { CategorySplitBanners } from '../components/home/CategorySplitBanners';
import { ProductCarouselSection } from '../components/home/ProductCarouselSection';
import { OurStorySplitSection } from '../components/home/OurStorySplitSection';
import { LatestNewsSection } from '../components/home/LatestNewsSection';
import { CustomerTestimonialsStrip } from '../components/home/CustomerTestimonialsStrip';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

/**
 * MOBILE-FIRST HOMEPAGE (Bonkers Corner 1:1 Architecture)
 *
 * Sequence:
 *   1. HeroBannerCarousel       → Full-bleed 9:16 vertical swipeable drops
 *   2. CategoryQuickNav         → Fast horizontal story rail for 1-tap category exploration
 *   3. ProductCarousel: New In  → 2.15-card peek horizontal CSS scroll-snap
 *   4. ProductCarousel: Bestsellers
 *   5. CategorySplitBanners     → High-impact visual gateways: MENS, WOMENS, NEW IN
 *   6. ProductCarousel: Shop Women
 *   7. ProductCarousel: Shop Men
 *   8. OurStorySplitSection     → Bold culture manifesto + 4-icon values
 *   9. LatestNewsSection        → Streetwear editorial blog snap-scroll
 *  10. CustomerTestimonialsStrip→ Community praise & verified buyer quotes
 *  11. TrustBadgesPreFooter     → 48-hr shipping, 5% prepaid off, 100% Made in India
 */
export const Home: React.FC = () => {
  const { data: products = [] } = useProducts();

  // Curate 4 merchandising mixes
  const newInProducts = useMemo(() => {
    return products.slice(0, 10);
  }, [products]);

  const bestSellerProducts = useMemo(() => {
    return products
      .filter((p) => (p.rating ?? 0) >= 4.7 || (p.reviewCount ?? 0) >= 25)
      .slice(0, 10);
  }, [products]);

  const womenProducts = useMemo(() => {
    return products
      .filter((p) => p.gender === 'women' || p.gender === 'unisex')
      .slice(0, 10);
  }, [products]);

  const menProducts = useMemo(() => {
    return products
      .filter((p) => p.gender === 'men' || p.gender === 'unisex')
      .slice(0, 10);
  }, [products]);

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* 1. Full-Bleed 9:16 Hero Swipeable Carousel */}
      <HeroBannerCarousel />

      {/* 2. Category Quick-Nav Story Rail */}
      <CategoryQuickNav />

      {/* 3. Horizontal Scroll-Snap Product Rows (2.15-Card Peek) */}
      <ProductCarouselSection
        title="New In"
        subtitle="Upgrade your closet with everything trendy and new"
        viewAllLink="/shop?sort=newest"
        viewAllText="Shop New Arrivals →"
        products={newInProducts}
      />

      <ProductCarouselSection
        title="Best Seller"
        subtitle="Handpicked and crafted for you"
        viewAllLink="/shop"
        viewAllText="Shop Bestsellers →"
        products={bestSellerProducts}
      />

      {/* 4. Gender Split Visual Gateway Banners */}
      <CategorySplitBanners />

      {/* 5. Gender-Specific Product Feeds */}
      <ProductCarouselSection
        title="Shop Women"
        subtitle="From everyday essentials to statement pieces"
        viewAllLink="/shop?gender=women"
        viewAllText="Shop Women →"
        products={womenProducts}
      />

      <ProductCarouselSection
        title="Shop Men"
        subtitle="Uncover the latest in men's fashion"
        viewAllLink="/shop?gender=men"
        viewAllText="Shop Mens →"
        products={menProducts}
      />

      {/* 6. Brand Manifesto & 4-Pillar Values */}
      <OurStorySplitSection />

      {/* 7. Editorial Blog Posts */}
      <LatestNewsSection />

      {/* 8. Social Proof / Community Testimonials */}
      <CustomerTestimonialsStrip />

      {/* 9. Trust Pre-Footer Guarantees */}
      <TrustBadgesPreFooter />
    </div>
  );
};
