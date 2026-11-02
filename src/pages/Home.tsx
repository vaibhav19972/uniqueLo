import React from 'react';
import { CastHero } from '../components/home/CastHero';
import { TrustStrip } from '../components/home/TrustStrip';
import { NewAndFeaturedSection } from '../components/home/NewAndFeaturedSection';
import { ShopByGarment } from '../components/home/ShopByGarment';
import { UniversePortals } from '../components/home/UniversePortals';
import { EditsGateway } from '../components/home/EditsGateway';
import { Bestsellers } from '../components/home/Bestsellers';
import { UGCWall } from '../components/home/UGCWall';
import { PresenceTriptych } from '../components/home/PresenceTriptych';
import { Newsletter } from '../components/home/Newsletter';

/**
 * HOME PAGE
 *
 * Storytelling & Catalog Sequence:
 *
 *   1. CastHero              → Who wears this (Opening brand identity)
 *   2. TrustStrip            → COD, delivery certainty, craft guarantee
 *   3. NewAndFeaturedSection → The live catalog, tabs with newest pieces (New arrivals)
 *   4. ShopByGarment         → "Shop by Garment" — Silhouette discovery rail
 *   5. UniversePortals       → "Worlds to Wear" — The four worlds (Itihaas, Animeverse, Heroverse, Atelier)
 *   6. EditsGateway          → "Explore by Edit" — Curated capsules swipe rail
 *   7. Bestsellers           → Verified community favorites rail
 *   8. UGCWall               → "Where the stitches come from" — Techniques table
 *   9. PresenceTriptych      → "How loudly do you wear it" — Expression & intensity scale
 *  10. Newsletter            → Low-friction email signup
 */
export const Home: React.FC = () => {
  return (
    <div className="w-full">
      <CastHero />
      <TrustStrip />
      <NewAndFeaturedSection />
      <ShopByGarment />
      <UniversePortals />
      <EditsGateway />
      <Bestsellers />
      <UGCWall />
      <PresenceTriptych />
      <Newsletter />
    </div>
  );
};
