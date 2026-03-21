import { endGame, getGame } from '@/api';
import { useNotification } from '@/hooks';
import type { Game } from '@/models/types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function GamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const [game, setGame] = useState<Game | null>(null);
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        if (!gameId) {
            notification.showError({
                message: "Impossible de charger la partie: identifiant manquant.",
            });
            return;
        }
        const currentGameId = gameId;

        async function loadGame() {
            try {
                const response = await getGame(currentGameId);

                setGame(response.game);
                notification.showSuccess({
                    message: 'Partie chargee avec succes.',
                });
            } catch {
                notification.showError({
                    message: 'Une erreur est survenue lors du chargement de la partie.',
                });
            }
        }

        void loadGame();
    }, [gameId, notification]);

    const roundsToDisplay = useMemo(() => {
        if (!game) {
            return [];
        }

        const roundsCount = game.nbRounds ?? Math.max(1, game.currentRound, game.roundHistory.length);
        return Array.from({ length: roundsCount }, (_, index) => index + 1);
    }, [game]);

    function getScore(roundNumber: number, playerName: string): number | null {
        if (!game) {
            return null;
        }

        const round = game.roundHistory[roundNumber - 1];
        const score = round?.playersScores.find((playerScore) => playerScore.playerName === playerName);
        return score?.score ?? null;
    }

    async function handleEndGame() {
        if (!gameId || isEnding) {
            return;
        }
        setIsEnding(true);
        try {
            await endGame(gameId);
            notification.showSuccess({
                message: 'Partie terminée.',
            });
            navigate('/');
        } catch {
            notification.showError({
                message: "Impossible de terminer la partie. Réessaie dans un instant.",
            });
            setIsEnding(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Score Board</h1>
                    {game && (
                        <p className="mt-2 text-xl font-medium text-slate-800">{game.boardGameName}</p>
                    )}
                </div>
                {game && (
                    <button
                        type="button"
                        disabled={isEnding}
                        onClick={() => void handleEndGame()}
                        className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isEnding ? 'Arrêt…' : 'Arrêter la partie'}
                    </button>
                )}
            </div>

            {!game && <p className="mt-6 text-slate-600">Chargement de la partie...</p>}

            {game && (
                <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-md border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                    Manche
                                </th>
                                {game.players.map((player) => (
                                    <th
                                        key={player.id ?? player.name}
                                        className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-700"
                                    >
                                        {player.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roundsToDisplay.map((roundNumber) => (
                                <tr key={roundNumber}>
                                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-800">{roundNumber}</td>
                                    {game.players.map((player) => {
                                        const score = getScore(roundNumber, player.name);

                                        return (
                                            <td
                                                key={`${roundNumber}-${player.id ?? player.name}`}
                                                className="border border-slate-300 px-4 py-2 text-sm text-slate-800"
                                            >
                                                {score ?? ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
