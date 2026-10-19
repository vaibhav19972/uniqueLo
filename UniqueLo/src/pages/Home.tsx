import React from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { TrustStrip } from '../components/home/TrustStrip';
import { UniversePortals } from '../components/home/UniversePortals';
import { FindYourExpression } from '../components/home/FindYourExpression';
import { NewAndFeaturedSection } from '../components/home/NewAndFeaturedSection';
import { ShopByGarment } from '../components/home/ShopByGarment';
import { CraftStory } from '../components/home/CraftStory';
import { EditsGateway } from '../components/home/EditsGateway';
import { UGCWall } from '../components/home/UGCWall';
import { Newsletter } from '../components/home/Newsletter';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Section 1: Edge-to-Edge Hero Carousel with circular timer pills */}
      <HeroCarousel />

      {/* Trust & Craft Value Strip */}
      <TrustStrip />

      {/* Section 2: Choose Your World (Universes & Worlds) */}
      <UniversePortals />

      {/* Section 3: Find Your Expression (5-Tier Intensity Spectrum) */}
      <FindYourExpression />

      {/* Section 4: New & Featured (Tabbed: New Arrivals | Bestsellers | Limited Editions) */}
      <NewAndFeaturedSection />

      {/* Section 5: Shop by Garment (Visual Silhouettes Grid) */}
      <ShopByGarment />

      {/* Section 6: The Craft (Haute Needlecraft & Thread Architecture) */}
      <CraftStory />

      {/* Section 7: Curated Edits (Shop by Buyer Intent) */}
      <EditsGateway />

      {/* Section 8: UGC Community Wall (Worn Worldwide) */}
      <UGCWall />

      {/* Section 9: Newsletter & Collector Registration */}
      <Newsletter />
    </div>
  );
};
