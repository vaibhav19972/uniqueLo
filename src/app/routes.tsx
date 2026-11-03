/* oxlint-disable react/only-export-components */
import React, { Suspense, lazy } from 'react';
import { type RouteObject } from 'react-router';
import { App } from './App';
import { Home } from '../pages/Home';
import { NotFound } from '../pages/NotFound';

const Shop = lazy(() => import('../pages/Shop').then((m) => ({ default: m.Shop })));
const Universe = lazy(() => import('../pages/Universe').then((m) => ({ default: m.Universe })));
const Universes = lazy(() => import('../pages/Universes').then((m) => ({ default: m.Universes })));
const Character = lazy(() => import('../pages/Character').then((m) => ({ default: m.Character })));
const Garments = lazy(() => import('../pages/Garments').then((m) => ({ default: m.Garments })));
const Garment = lazy(() => import('../pages/Garment').then((m) => ({ default: m.Garment })));
const Collections = lazy(() => import('../pages/Collections').then((m) => ({ default: m.Collections })));
const Collection = lazy(() => import('../pages/Collection').then((m) => ({ default: m.Collection })));
const GenderPage = lazy(() => import('../pages/Gender').then((m) => ({ default: m.GenderPage })));
const ProductDetail = lazy(() => import('../pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Atelier = lazy(() => import('../pages/Atelier').then((m) => ({ default: m.Atelier })));
const AtelierTechnique = lazy(() => import('../pages/AtelierTechnique').then((m) => ({ default: m.AtelierTechnique })));
const Expressions = lazy(() => import('../pages/Expressions').then((m) => ({ default: m.Expressions })));
const Expression = lazy(() => import('../pages/Expression').then((m) => ({ default: m.Expression })));
const NewFeatured = lazy(() => import('../pages/NewFeatured').then((m) => ({ default: m.NewFeatured })));
const Admin = lazy(() => import('../pages/Admin').then((m) => ({ default: m.Admin })));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation').then((m) => ({ default: m.OrderConfirmation })));
const Orders = lazy(() => import('../pages/Orders').then((m) => ({ default: m.Orders })));
const Checkout = lazy(() => import('../pages/Checkout').then((m) => ({ default: m.Checkout })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent mb-3" />
    <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Loading Drop…</p>
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
        path: 'shop-all',
        element: withSuspense(<Shop />),
      },
      // 1. Worlds (Spec Primary Nav 1)
      {
        path: 'worlds',
        element: withSuspense(<Universes />),
      },
      {
        path: 'worlds/:universeSlug',
        element: withSuspense(<Universe />),
      },
      {
        path: 'universes',
        element: withSuspense(<Universes />),
      },
      {
        path: 'universes/:universeSlug',
        element: withSuspense(<Universe />),
      },
      {
        path: 'universes/:universeSlug/characters/:characterId',
        element: withSuspense(<Character />),
      },
      // 2. Styles (Spec Primary Nav 2 - Signature Discovery Axis: Minimal, Understated, Cult, Expressive, Maximalist)
      {
        path: 'styles',
        element: withSuspense(<Expressions />),
      },
      {
        path: 'styles/:styleSlug',
        element: withSuspense(<Expression />),
      },
      // Backward-compatible expression routes
      {
        path: 'expression',
        element: withSuspense(<Expressions />),
      },
      {
        path: 'expression/:expressionSlug',
        element: withSuspense(<Expression />),
      },
      // 3. Clothing (Spec Primary Nav 3)
      {
        path: 'clothing',
        element: withSuspense(<Garments />),
      },
      {
        path: 'clothing/:garmentSlug',
        element: withSuspense(<Garment />),
      },
      {
        path: 'garments',
        element: withSuspense(<Garments />),
      },
      {
        path: 'garments/:garmentSlug',
        element: withSuspense(<Garment />),
      },
      // 4. New & Featured (Spec Primary Nav 4)
      {
        path: 'new-featured',
        element: withSuspense(<NewFeatured />),
      },
      {
        path: 'new-featured/:tabSlug',
        element: withSuspense(<NewFeatured />),
      },
      // 5. Our Craft (Spec Primary Nav 5)
      {
        path: 'our-craft',
        element: withSuspense(<Atelier />),
      },
      {
        path: 'our-craft/:techniqueSlug',
        element: withSuspense(<AtelierTechnique />),
      },
      {
        path: 'atelier',
        element: withSuspense(<Atelier />),
      },
      {
        path: 'atelier/:techniqueSlug',
        element: withSuspense(<AtelierTechnique />),
      },
      // Collections (Curated Drops & Thematic Capsules)
      {
        path: 'collections',
        element: withSuspense(<Collections />),
      },
      {
        path: 'collections/:collectionSlug',
        element: withSuspense(<Collection />),
      },
      {
        path: 'men',
        element: withSuspense(<GenderPage />),
      },
      {
        path: 'women',
        element: withSuspense(<GenderPage />),
      },
      // Product PDP (singular, plural, and shop alias)
      {
        path: 'product/:slug',
        element: withSuspense(<ProductDetail />),
      },
      {
        path: 'products/:slug',
        element: withSuspense(<ProductDetail />),
      },
      {
        path: 'shop/:slug',
        element: withSuspense(<ProductDetail />),
      },
      {
        path: 'admin',
        element: withSuspense(<Admin />),
      },
      {
        path: 'checkout',
        element: withSuspense(<Checkout />),
      },
      {
        path: 'order-confirmation/:orderId',
        element: withSuspense(<OrderConfirmation />),
      },
      {
        path: 'order/:orderId',
        element: withSuspense(<OrderConfirmation />),
      },
      {
        path: 'track-order',
        element: withSuspense(<OrderConfirmation />),
      },
      {
        path: 'orders',
        element: withSuspense(<Orders />),
      },
      {
        // Landing target for the password-recovery email. Must stay in sync
        // with the `redirectTo` in stores/auth.ts AND the Redirect URLs
        // allowlist in Supabase → Authentication → URL Configuration.
        path: 'reset-password',
        element: withSuspense(<ResetPassword />),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
