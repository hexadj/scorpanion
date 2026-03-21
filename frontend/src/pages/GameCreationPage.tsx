import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createGame } from '@/api';
import { useNotification } from '@/hooks';

type GameCreationLocationState = {
    boardGameName?: string;
};

export function GameCreationPage() {
    const { boardGameId } = useParams<{ boardGameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as GameCreationLocationState | null | undefined;
    const boardGameName =
        locationState?.boardGameName ?? boardGameId ?? 'Jeu';
    const notification = useNotification();
    const [playersCount, setPlayersCount] = useState<number>(2);
    const [roundsCount, setRoundsCount] = useState<number>(3);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await createGame({
                boardGameId: boardGameId ?? '',
                scoreboardId: null,
                roundsCount,
                players: [],
            });

            if (response.gameId) {
                navigate(`../play/${response.gameId}`);
                return;
            }

            notification.showError({
                message: 'La creation de la partie a echoue.',
            });
        } catch {
            notification.showError({
                message: "Une erreur est survenue lors du demarrage de la partie.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{boardGameName}</h1>
            <p className="mt-2 text-slate-600">Création de partie</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="playersCount">
                        Nombre de joueurs
                    </label>
                    <input
                        id="playersCount"
                        min={1}
                        type="number"
                        value={playersCount}
                        onChange={(event) => setPlayersCount(Number(event.target.value))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="roundsCount">
                        Nombre de manches
                    </label>
                    <input
                        id="roundsCount"
                        min={1}
                        type="number"
                        value={roundsCount}
                        onChange={(event) => setRoundsCount(Number(event.target.value))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Starting...' : 'Start'}
                </button>
            </form>
        </main>
    );
}
