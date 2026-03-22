import { BoardGameCard } from '@/components/BoardGameCard';
import { FortuneWheel } from '@/components/FortuneWheel';
import { SpinningArrow } from '@/components/SpinningArrow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getBoardgames } from '@/api';
import { useEffect, useState } from 'react';
import type { BoardGame } from '@/models/types';

export function HomePage() {
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
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Scorpanion</h1>

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

      <Separator className="my-10" />

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
