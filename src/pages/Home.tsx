import React from 'react';
import { CastHero } from '../components/home/CastHero';
import { TrustStrip } from '../components/home/TrustStrip';
import { NewAndFeaturedSection } from '../components/home/NewAndFeaturedSection';
import { UniversePortals } from '../components/home/UniversePortals';
import { PresenceTriptych } from '../components/home/PresenceTriptych';
import { Bestsellers } from '../components/home/Bestsellers';
import { UGCWall } from '../components/home/UGCWall';
import { BrowseIndex } from '../components/home/BrowseIndex';
import { Newsletter } from '../components/home/Newsletter';

/**
 * HOME PAGE
 *
 * Combines the hero, presence triptych, and tiled menu directory
 * with the catalog showcase sections:
 *
 *   1. CastHero              → Who wears this
 *   2. TrustStrip            → COD, delivery certainty, craft guarantee
 *   3. NewAndFeaturedSection → The live catalog, tabs with priced pieces
 *   4. UniversePortals       → The three worlds (Itihaas, Animeverse, Heroverse)
 *   5. PresenceTriptych      → How loudly do you wear it (Quiet / Balanced / Loud)
 *   6. Bestsellers           → Verified community favorites rail
 *   7. UGCWall               → "Where the stitches come from" — Techniques table
 *   8. BrowseIndex           → "Here's the menu." — Tiled directory by cut & intent
 *   9. Newsletter            → Low-friction email signup
 */
export const Home: React.FC = () => {
  return (
    <div className="w-full">
      <CastHero />
      <TrustStrip />
      <NewAndFeaturedSection />
      <UniversePortals />
      <PresenceTriptych />
      <Bestsellers />
      <UGCWall />
      <BrowseIndex />
      <Newsletter />
    </div>
  );
};
