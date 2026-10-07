import { type RouteObject } from 'react-router';
import { App } from './App';
import { Home } from '../pages/Home';
import { Shop } from '../pages/Shop';
import { ProductDetail } from '../pages/ProductDetail';

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
        path: '*',
        element: <Home />,
      },
    ],
  },
];
