import { type RouteObject } from 'react-router';
import { App } from './App';
import { Home } from '../pages/Home';
import { Shop } from '../pages/Shop';
import { ProductDetail } from '../pages/ProductDetail';
import { Atelier } from '../pages/Atelier';
import { AtelierTechnique } from '../pages/AtelierTechnique';
import { NotFound } from '../pages/NotFound';

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
        element: <Shop />,
      },
      {
        path: 'product/:slug',
        element: <ProductDetail />,
      },
      {
        path: 'atelier',
        element: <Atelier />,
      },
      {
        path: 'atelier/:techniqueSlug',
        element: <AtelierTechnique />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
