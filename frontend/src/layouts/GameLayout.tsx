import { getGame } from '@/api';
import { GameProvider } from '@/contexts/GameContext';
import type { Game } from '@/models/types';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '@/hooks';

type LoadState = 'loading' | 'ready';

type GameLayoutContentProps = {
    gameId: string;
};

/**
 * État et chargement pour une `gameId` donnée. Monté avec `key={gameId}` depuis le layout
 * pour repartir d’un état vierge à chaque changement de partie (pas d’affichage de l’ancienne partie pendant le fetch).
 */
function GameLayoutContent({ gameId }: GameLayoutContentProps) {
    const navigate = useNavigate();
    const notification = useNotification();

    const [game, setGame] = useState<Game | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('loading');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const response = await getGame(gameId);
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

        return () => {
            cancelled = true;
        };
    }, [gameId, navigate, notification]);

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

/**
 * Barrière de route pour `…/play/:gameId` :
 *
 * - charge la partie une fois l’`gameId` connu ;
 * - redirige vers `/` si l’ID manque dans l’URL ou si l’API échoue ;
 * - affiche un écran de chargement jusqu’à avoir un `game` valide ;
 * - enveloppe ensuite les enfants (`Outlet`) avec `GameProvider` pour que toute la sous-arborescence
 *   lise la même `Game` sans refaire de `getGame`.
 *
 * Un changement de `gameId` (navigation vers une autre partie) remonte le contenu (`key`) pour repartir d’un état vierge.
 */
export function GameLayout() {
    const { gameId } = useParams();

    if (!gameId) {
        return <Navigate to="/" replace />;
    }

    return <GameLayoutContent key={gameId} gameId={gameId} />;
}
