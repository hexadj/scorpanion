import { useCallback, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createGame } from '@/api';
import { PlayerSelection } from '@/components/PlayerSelection';
import { useNotification } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Player } from '@/models/types';

type GameCreationLocationState = {
    boardGameName?: string;
};

export function GameCreationPage() {
    const { boardGameId } = useParams<{ boardGameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as GameCreationLocationState | null | undefined;
    const boardGameName = locationState?.boardGameName ?? boardGameId ?? 'Jeu';
    const notification = useNotification();

    const [roundsCount, setRoundsCount] = useState<number>(3);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [players, setPlayers] = useState<Player[]>([]);

    const onPlayersChange = useCallback((next: Player[]) => {
        setPlayers(next);
    }, []);

    const canSubmit = players.length >= 1 && !isSubmitting;

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) {
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await createGame({
                boardGameId: boardGameId ?? '',
                scoreboardId: null,
                roundsCount,
                players,
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
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">{boardGameName}</h1>
            <p className="mt-2 text-muted-foreground">Création de partie</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <PlayerSelection onPlayersChange={onPlayersChange} />

                <div className="space-y-2">
                    <Label htmlFor="roundsCount">Nombre de manches</Label>
                    <Input
                        id="roundsCount"
                        min={1}
                        type="number"
                        value={roundsCount}
                        onChange={(event) => setRoundsCount(Number(event.target.value))}
                    />
                </div>

                <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? 'Démarrage…' : 'Démarrer'}
                </Button>
            </form>
        </main>
    );
}
