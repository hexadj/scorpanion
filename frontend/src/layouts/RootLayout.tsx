/**
 * Layout racine : rend l'Outlet et le conteneur de notifications (toast).
 */
import { Outlet } from 'react-router-dom';
import { NotificationContainer } from '@/components';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <NotificationContainer />
    </>
  );
}
