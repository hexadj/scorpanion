/**
 * Layout racine : rend l'Outlet et les toasts (Sonner / shadcn).
 */
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="bottom-center" />
    </>
  );
}
