import React from 'react';
import { HeroStage } from '../components/home/HeroStage';
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

/**
 * The catalog is the page.
 *
 * Order is the argument the page makes, and it is deliberately not the
 * category's order. The old build opened on a four-slide campaign carousel,
 * then ran three near-identical product grids before the buyer had seen a
 * price. This one answers the three questions an Indian D2C buyer asks, in
 * the order they ask them:
 *
 *   1. What is this, and what does it cost?   → HeroStage (with real price)
 *   2. Is any of this actually for me?        → New & Featured, by garment
 *   3. Which of these worlds is mine?         → Universes as horizon bands
 *
 * Trust (COD, returns, delivery) is answered in the strip directly under the
 * hero rather than buried in the footer, because in tier 2/3 it is the
 * question that stops the order, not a closing argument.
 */
export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1 — The first viewport: one garment, one price, one action. */}
      <HeroStage />

      {/* 2 — Trust. COD and delivery certainty, said plainly, before any grid. */}
      <TrustStrip />

      {/* 3 — The index: what is actually available, with prices. */}
      <NewAndFeaturedSection />

      {/* 4 — The cut: browse by what kind of thing it is. */}
      <ShopByGarment />

      {/* 5 — The worlds: places you enter, each with its own horizon. */}
      <UniversePortals />

      {/* 6 — The volume axis: how loudly you want to wear it. */}
      <FindYourExpression />

      {/* 7 — Buyer intent: curated edits rather than facets. */}
      <EditsGateway />

      {/* 8 — Social proof, only from real catalog data. */}
      <Bestsellers />

      {/* 9 — The craft moment: the one place the page goes dark. */}
      <CraftStory />

      {/* 10 — Worn, shown. */}
      <UGCWall />

      {/* 11 — The ask. */}
      <Newsletter />
    </div>
  );
};
