import React from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { TrustStrip } from '../components/home/TrustStrip';
import { NewAndFeaturedSection } from '../components/home/NewAndFeaturedSection';
import { ShopByGarment } from '../components/home/ShopByGarment';
import { UniversePortals } from '../components/home/UniversePortals';
import { FindYourExpression } from '../components/home/FindYourExpression';
import { EditsGateway } from '../components/home/EditsGateway';
import { Bestsellers } from '../components/home/Bestsellers';
import { CraftStory } from '../components/home/CraftStory';
import { UGCWall } from '../components/home/UGCWall';
import { Newsletter } from '../components/home/Newsletter';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Section 1: Edge-to-Edge Hero Carousel with circular timer pills */}
      <HeroCarousel />

      {/* Trust & Craft Value Strip */}
      <TrustStrip />

      {/* Section 2: New & Featured (Tabbed: New Arrivals | Limited Editions | Collections) */}
      <NewAndFeaturedSection />

      {/* Section 3: Shop by Garment (Visual Silhouettes Grid) */}
      <ShopByGarment />

      {/* Section 4: Choose Your World (Universes & Worlds) */}
      <UniversePortals />

      {/* Section 5: Find Your Expression (5-Tier Intensity Spectrum) */}
      <FindYourExpression />

      {/* Section 6: Curated Edits (Shop by Buyer Intent) */}
      <EditsGateway />

      {/* Section 7: Bestsellers (Community Favourites Archive) */}
      <Bestsellers />

      {/* Section 8: The Craft (Haute Needlecraft & Thread Architecture) */}
      <CraftStory />

      {/* Section 9: UGC Community Wall (Worn Worldwide) */}
      <UGCWall />

      {/* Section 10: Newsletter & Collector Registration */}
      <Newsletter />
    </div>
  );
};
