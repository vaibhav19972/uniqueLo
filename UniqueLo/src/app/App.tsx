import React from 'react';
import { useLenisScrollReset } from '../lib/lenis';
import { Layout } from './Layout';

export const App: React.FC = () => {
  useLenisScrollReset();
  return <Layout />;
};
