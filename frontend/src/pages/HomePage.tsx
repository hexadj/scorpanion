import { BoardGameCard } from '@/components/BoardGameCard';
import { getBoardgames } from '@/api';
import { useEffect, useState } from 'react';
import type { BoardGame } from '@/models/types';

export function HomePage() {
    const [boardGames, setBoardGames] = useState<BoardGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        </main>
    );
}
