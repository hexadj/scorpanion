import { GamePageHeader } from '@/components/GamePageHeader';
import { GameScoreTable } from '@/components/GameScoreTable';
import { RoundScoreModal } from '@/components/RoundScoreModal';
import { useGameScores } from '@/hooks/useGameScores';
import { scoresRecordForRound } from '@/utils/gameScore.utils';
import { useState } from 'react';

export function GamePage() {
    const { game, currentRound, isEnding, isSaving, draft, roundsToDisplay, submitRound, handleEndGame } =
        useGameScores();

    const [modalRound, setModalRound] = useState<number | null>(null);

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
            <GamePageHeader
                boardGameName={game.boardGameName}
                isSaving={isSaving}
                isEnding={isEnding}
                onEndRound={() => setModalRound(currentRound)}
                onEndGame={handleEndGame}
            />
            <div className="mt-8">
                <GameScoreTable
                    players={game.players ?? []}
                    roundsToDisplay={roundsToDisplay}
                    currentRound={currentRound}
                    draft={draft}
                    isSaving={isSaving}
                    onEditPastRound={(roundNumber) => setModalRound(roundNumber)}
                />
            </div>

            {modalRound != null && (
                <RoundScoreModal
                    key={modalRound}
                    title={`Manche ${modalRound}`}
                    players={game.players ?? []}
                    initialScores={scoresRecordForRound(game, modalRound, draft)}
                    isSubmitting={isSaving}
                    onClose={() => setModalRound(null)}
                    onConfirm={async (scores) => {
                        const ok = await submitRound(modalRound, scores);
                        if (ok) {
                            setModalRound(null);
                        }
                    }}
                />
            )}
        </main>
    );
}
