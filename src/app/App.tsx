import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { useLenisScrollReset } from '../lib/lenis';
import { Layout } from './Layout';

export const App: React.FC = () => {
  useLenisScrollReset();
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
    </QueryClientProvider>
  );
};
