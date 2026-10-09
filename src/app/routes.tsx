/* oxlint-disable react/only-export-components */
import React, { Suspense, lazy } from 'react';
import { type RouteObject } from 'react-router';
import { App } from './App';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';

const Shop = lazy(() => import('../pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetail = lazy(() => import('../pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Atelier = lazy(() => import('../pages/Atelier').then((m) => ({ default: m.Atelier })));
const AtelierTechnique = lazy(() => import('../pages/AtelierTechnique').then((m) => ({ default: m.AtelierTechnique })));
const Admin = lazy(() => import('../pages/Admin').then((m) => ({ default: m.Admin })));

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-cream">
    <p className="font-serif text-xl text-ink animate-pulse">Unfolding Atelier Piece...</p>
  </div>
);

const withSuspense = (el: React.ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop',
        element: withSuspense(<Shop />),
      },
      {
        path: 'product/:slug',
        element: withSuspense(<ProductDetail />),
      },
      {
        path: 'atelier',
        element: withSuspense(<Atelier />),
      },
      {
        path: 'atelier/:techniqueSlug',
        element: withSuspense(<AtelierTechnique />),
      },
      {
        path: 'admin',
        element: withSuspense(<Admin />),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
