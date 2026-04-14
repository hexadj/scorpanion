import { createBrowserRouter } from 'react-router-dom';
import { GameListPage, NewSessionPage, PlayerListPage } from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GameListPage />,
  },
  {
    path: '/players',
    element: <PlayerListPage />,
  },
  {
    path: '/sessions/new',
    element: <NewSessionPage />,
  },
]);
