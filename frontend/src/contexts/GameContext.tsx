/**
 * Contexte de la partie en cours : état serveur (`game`) partagé sous la route `play/:gameId`.
 *
 * Monté uniquement par `GameLayout` après chargement réussi — pas de valeur par défaut globale.
 * Les mises à jour (ex. après `updateGame`) passent par `setGame` pour garder une seule source de vérité.
 */
import type { Game } from '@/models/types';
import { createContext, useContext, type ReactNode } from 'react';

type GameContextValue = {
    game: Game;
    setGame: (game: Game) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type GameProviderProps = {
    game: Game;
    setGame: (game: Game) => void;
    children: ReactNode;
};

/** Enveloppe les routes enfants du layout et expose `game` / `setGame`. */
export function GameProvider({ game, setGame, children }: GameProviderProps) {
    return <GameContext.Provider value={{ game, setGame }}>{children}</GameContext.Provider>;
}

/** Hook réservé aux composants rendus sous `GameLayout` (sinon erreur explicite). */
export function useGameContext(): GameContextValue {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGameContext doit être utilisé sous GameProvider (route protégée par GameLayout).');
    }
    return ctx;
}
