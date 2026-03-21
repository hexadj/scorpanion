import { BoardGameCard } from '@/components/BoardGameCard';
import { FortuneWheel } from '@/components/FortuneWheel';
import { SpinningArrow } from '@/components/SpinningArrow';
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
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Scorpanion</h1>
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">Jeux</h2>
        {isLoading ? (
          <p className="text-slate-600">Chargement…</p>
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

      <section className="mt-12 border-t border-slate-200 pt-10">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-slate-500">
          Démos
        </h2>
        <div className="flex flex-col gap-12">
          <SpinningArrow />
          <div>
            <FortuneWheel
              categories={['Perdu', 'Relance', 'Bonus', 'Joker', 'Gagner', 'Perdu', 'Relance', 'Bonus', 'Joker', 'Gagner']}
              spinDuration={1.2}
              rotationSpeed={10}
              onResult={(_index, label) => {
                setWheelResult(label);
              }}
            />
            {wheelResult !== null ? (
              <p className="mt-3 text-center text-sm text-slate-600">
                Résultat : <span className="font-medium text-slate-900">{wheelResult}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
