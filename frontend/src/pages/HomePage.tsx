import { BoardGameCard } from '@/components/BoardGameCard';
import { FortuneWheel } from '@/components/FortuneWheel';
import { SpinningArrow } from '@/components/SpinningArrow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getBoardgames } from '@/api';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { clearUser } from '@/store/authSlice';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { BoardGame } from '@/models/types';

export function HomePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const [boardGames, setBoardGames] = useState<BoardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await getBoardgames();
        if (!cancelled) {
          setBoardGames(list);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Scorpanion</h1>
        {authUser !== null ? (
          <div className="flex min-w-0 max-w-[min(100%,18rem)] items-center gap-3 sm:max-w-none">
            <span className="truncate text-sm font-medium text-foreground" title={authUser.username}>
              {authUser.username}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => {
                dispatch(clearUser());
                toast.message('Vous êtes déconnecté.');
              }}
            >
              Se déconnecter
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to="/login">Connexion</Link>
          </Button>
        )}
      </header>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">Jeux</h2>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[72px] w-full rounded-xl" />
            <Skeleton className="h-[72px] w-full rounded-xl" />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {boardGames.map((bg) => (
              <li key={bg.id}>
                <BoardGameCard boardGame={bg} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {authUser !== null ? (
        <>
          <Separator className="my-10" />
          <section>
            <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Historique
            </h2>
            <Button
              asChild
              className="w-full justify-center rounded-xl bg-blue-600 text-lg font-semibold tracking-tight text-white hover:bg-blue-700"
            >
              <Link to="/history">Voir son historique</Link>
            </Button>
          </section>
          <Separator className="my-10" />
        </>
      ) : (
        <Separator className="my-10" />
      )}

      <section>
        <h2 className="mb-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Démos
        </h2>
        <div className="flex flex-col gap-12">
          <SpinningArrow />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roue de la fortune</CardTitle>
              <CardDescription>Démo interactive</CardDescription>
            </CardHeader>
            <CardContent>
              <FortuneWheel
                categories={[
                  'Perdu',
                  'Relance',
                  'Bonus',
                  'Joker',
                  'Gagner',
                  'Perdu',
                  'Relance',
                  'Bonus',
                  'Joker',
                  'Gagner',
                ]}
                spinDuration={1.2}
                rotationSpeed={10}
                onResult={(_index, label) => {
                  setWheelResult(label);
                }}
              />
              {wheelResult !== null ? (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Résultat :{' '}
                  <span className="font-medium text-foreground">{wheelResult}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
