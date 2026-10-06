import { type RouteObject } from 'react-router';
import { App } from './App';
import { Home } from '../pages/Home';
import { Shop } from '../pages/Shop';

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
        path: '*',
        element: <Home />,
      },
    ],
  },
];
