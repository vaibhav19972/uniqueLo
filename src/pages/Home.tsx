import React from 'react';
import { Hero } from '../components/home/Hero';
import { CategoryStrip } from '../components/home/CategoryStrip';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { EditorialSplit } from '../components/home/EditorialSplit';
import { Lookbook } from '../components/home/Lookbook';
import { Newsletter } from '../components/home/Newsletter';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <CategoryStrip />
      <FeaturedProducts />
      <EditorialSplit />
      <Lookbook />
      <Newsletter />
    </div>
  );
};
