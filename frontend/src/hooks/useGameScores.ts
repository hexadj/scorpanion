/**
 * Logique métier du tableau de scores : affichage aligné sur `game`, enregistrement d’une manche
 * via modale (`submitRound` → `updateGame`) et fin de partie.
 *
 * Prérequis : être sous `GameProvider` (chargement et `game` garantis par `GameLayout`).
 */
import { endGame, updateGame } from '@/api';
import { useGameContext } from '@/contexts/GameContext';
import { buildCompleteRoundFromScores, buildDraftSnapshotFromGame, validateRoundComplete } from '@/utils/gameScore.utils';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from './useNotification';

export function useGameScores() {
    const { gameId } = useParams();
    const { game, setGame } = useGameContext();
    const navigate = useNavigate();
    const notification = useNotification();

    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [draft, setDraft] = useState<Record<string, string>>({});

    const roundsToDisplay = useMemo(() => {
        const roundsCount = game.nbRounds ?? Math.max(1, game.currentRound, game.roundHistory.length);
        return Array.from({ length: roundsCount }, (_, index) => index + 1);
    }, [game]);

    useEffect(() => {
        const next = buildDraftSnapshotFromGame(game, roundsToDisplay);
        setDraft(next);
    }, [game, roundsToDisplay]);

    async function submitRound(roundNumber: number, scores: Record<string, string>): Promise<boolean> {
        if (!gameId || isSaving) {
            return false;
        }
        const validationError = validateRoundComplete(game, scores);
        if (validationError) {
            notification.showError({ message: validationError });
            return false;
        }
        setIsSaving(true);
        try {
            const round = buildCompleteRoundFromScores(roundNumber, game.players, scores);
            const response = await updateGame(gameId, { rounds: [round] });
            setGame(response.game);
            notification.showSuccess({
                message: 'Manche enregistrée.',
            });
            return true;
        } catch {
            notification.showError({
                message: "Impossible d'enregistrer la manche. Réessaie dans un instant.",
            });
            return false;
        } finally {
            setIsSaving(false);
        }
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

    return {
        game,
        isEnding,
        isSaving,
        draft,
        roundsToDisplay,
        submitRound,
        handleEndGame,
    };
}
