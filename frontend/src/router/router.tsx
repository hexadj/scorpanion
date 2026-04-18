import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage, NewSessionPage, RootLayout, StatsPage, HistoryPage } from '../pages';

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
        path: '/history',
        element: <HistoryPage />,
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
