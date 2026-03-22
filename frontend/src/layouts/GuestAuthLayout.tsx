/**
 * Réservé aux visiteurs non connectés : inscription / connexion.
 * Si un utilisateur est déjà en session, redirection vers l’accueil.
 */
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useStore';
import { House } from 'lucide-react';
import { Link, Navigate, Outlet } from 'react-router-dom';

export function GuestAuthLayout() {
  const user = useAppSelector((s) => s.auth.user);

  if (user !== null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/" aria-label="Retour à l’accueil">
            <House className="size-4" />
            Accueil
          </Link>
        </Button>
      </header>
      <Outlet />
    </div>
  );
}
