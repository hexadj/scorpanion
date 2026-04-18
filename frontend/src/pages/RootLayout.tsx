import { Outlet } from 'react-router-dom';
import { useGetGamesQuery, useGetPlayersQuery } from '../services';

export const RootLayout = () => {
  useGetGamesQuery();
  useGetPlayersQuery();
  return <Outlet />;
};
