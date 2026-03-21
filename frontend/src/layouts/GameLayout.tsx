import { getGame } from '@/api';
import { GameProvider } from '@/contexts/GameContext';
import type { Game } from '@/models/types';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '@/hooks';

type LoadState = 'loading' | 'ready';

/**
 * Barrière de route pour `…/play/:gameId` :
 *
 * - charge la partie une fois l’`gameId` connu ;
 * - redirige vers `/` si l’ID manque dans l’URL ou si l’API échoue ;
 * - affiche un écran de chargement jusqu’à avoir un `game` valide ;
 * - enveloppe ensuite les enfants (`Outlet`) avec `GameProvider` pour que toute la sous-arborescence
 *   lise la même `Game` sans refaire de `getGame`.
 *
 * Un changement de `gameId` (navigation vers une autre partie) remet l’état local à zéro avant un nouveau fetch.
 */
export function GameLayout() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();

    const [game, setGame] = useState<Game | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('loading');

    useEffect(() => {
        if (!gameId) {
            return;
        }

        const currentGameId = gameId;

        // Nouvelle partie cible : on évite d’afficher brièvement l’ancienne avant la réponse réseau.
        setLoadState('loading');
        setGame(null);

        let cancelled = false;

        async function load() {
            try {
                const response = await getGame(currentGameId);
                if (cancelled) {
                    return;
                }
                setGame(response.game);
                setLoadState('ready');
                notification.showSuccess({
                    message: 'Partie chargée avec succès.',
                });
            } catch {
                if (cancelled) {
                    return;
                }
                notification.showError({
                    message: 'Une erreur est survenue lors du chargement de la partie.',
                });
                navigate('/', { replace: true });
            }
        }

        void load();

        // Évite setState après démontage ou si `gameId` change pendant la requête.
        return () => {
            cancelled = true;
        };
    }, [gameId, navigate, notification]);

    // Paramètre de route absent (URL mal formée) : redirection immédiate côté client.
    if (!gameId) {
        return <Navigate to="/" replace />;
    }

    // Tant que la requête n’a pas abouti, pas de provider — les enfants ne montent pas.
    if (loadState === 'loading' || !game) {
        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-10">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Score Board</h1>
                    <p className="text-slate-600">Chargement de la partie…</p>
                </div>
            </main>
        );
    }

    return (
        <GameProvider game={game} setGame={setGame}>
            <Outlet />
        </GameProvider>
    );
}
