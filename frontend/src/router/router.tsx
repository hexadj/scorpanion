import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage, NewSessionPage, StatsPage } from '../pages';
import { RootLayout } from '../layouts';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/stats',
        element: <StatsPage />,
      },
      {
        path: '/sessions/new',
        element: <NewSessionPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
