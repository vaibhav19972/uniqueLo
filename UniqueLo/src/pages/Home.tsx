import React from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { TrustStrip } from '../components/home/TrustStrip';
import { EditsGateway } from '../components/home/EditsGateway';
import { UniversePortals } from '../components/home/UniversePortals';
import { CraftStory } from '../components/home/CraftStory';
import { Bestsellers } from '../components/home/Bestsellers';
import { UGCWall } from '../components/home/UGCWall';
import { Newsletter } from '../components/home/Newsletter';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Section 1: Edge-to-Edge Hero Carousel with circular timer pills */}
      <HeroCarousel />
      <TrustStrip />
      <EditsGateway />
      <UniversePortals />
      <CraftStory />
      <Bestsellers />
      <UGCWall />
      <Newsletter />
    </div>
  );
};
