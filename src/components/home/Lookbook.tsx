import React, { useState } from 'react';
import { Link } from 'react-router';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

interface LookItem {
  id: string;
  volume: string;
  title: string;
  subtitle: string;
  quote: string;
  image: string;
  featuredSlug: string;
}

const LOOKS: LookItem[] = [
  {
    id: 'vol-1',
    volume: 'Volume 01',
    title: 'Winter Flora & Botanical Silk',
    subtitle: 'Wild alpine roses rendered in mulberry floss over heavy cotton canvas.',
    quote: '"The needle creates a botanical relief that printed ink can never simulate."',
    image: '/images/campaigns/lookbook-01.jpg',
    featuredSlug: 'botanical-silk-embroidered-jacket',
  },
  {
    id: 'vol-2',
    volume: 'Volume 02',
    title: 'Celestial Zardozi Wirework',
    subtitle: 'Astronomical constellations hand-anchored in French bullion wires.',
    quote: '"Gold wire reflects ambient light as the wearer moves through candlelit salons."',
    image: '/images/campaigns/lookbook-02.jpg',
    featuredSlug: 'celestial-zardozi-wool-coat',
  },
  {
    id: 'vol-3',
    volume: 'Volume 03',
    title: 'Sashiko Architectural Indigo',
    subtitle: 'Japanese Toyoda shuttle-loom denim reinforced with geometric rice-grain stitches.',
    quote: '"Form follows tactile endurance; embroidery as structural reinforcement."',
    image: '/images/campaigns/lookbook-03.jpg',
    featuredSlug: 'selvedge-sashiko-embroidered-denim',
  },
];

export const Lookbook: React.FC = () => {
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const activeLook = LOOKS[activeLookIndex];

  return (
    <section className="py-24 bg-ink text-cream border-b border-stone/20 overflow-hidden">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header & Look Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-10 border-b border-stone/20 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
              <span>✦</span>
              <span>Visual Anthology</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-cream mt-2">
              The Atelier Lookbook
            </h2>
          </div>

          {/* Volume Tabs */}
          <div className="flex space-x-4 sm:space-x-8">
            {LOOKS.map((look, idx) => (
              <button
                key={look.id}
                onClick={() => setActiveLookIndex(idx)}
                className={`py-2 text-xs sm:text-sm uppercase tracking-[0.2em] transition-colors relative cursor-pointer font-medium ${
                  activeLookIndex === idx ? 'text-accent' : 'text-stone/60 hover:text-stone'
                }`}
              >
                {look.volume}
                {activeLookIndex === idx && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Look Display Area */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Full-bleed Look Image */}
          <div className="lg:col-span-7 relative aspect-[16/10] bg-stone/20 overflow-hidden border border-stone/20">
            <Image
              src={activeLook.image}
              alt={activeLook.title}
              aspectRatio="16/10"
              className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-ink/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest text-cream border border-stone/20">
              {activeLook.volume} Campaign
            </div>
          </div>

          {/* Look Details & Quotes */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-mono">
              Editorial Feature
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl text-cream leading-tight">
              {activeLook.title}
            </h3>

            <p className="text-sm text-stone/80 leading-relaxed font-light">
              {activeLook.subtitle}
            </p>

            <blockquote className="border-l-2 border-accent pl-4 py-1 italic font-serif text-base text-cream/90">
              {activeLook.quote}
            </blockquote>

            <div className="pt-4 flex gap-4">
              <Link to="/shop">
                <Button variant="accent" size="md" className="text-xs tracking-widest">
                  Shop This Look
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
