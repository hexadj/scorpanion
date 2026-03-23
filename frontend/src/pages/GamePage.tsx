import { GamePageHeader } from '@/components/GamePageHeader';
import { GameScoreTable } from '@/components/GameScoreTable';
import { RoundScoreModal } from '@/components/RoundScoreModal';
import { GameResultPanel } from '../components/GameResultPanel';
import { useGameScores } from '@/hooks/useGameScores';
import { fillScoresForPlayers, scoresRecordForRound } from '@/utils/gameScore.utils';
import { useState } from 'react';

export function GamePage() {
    const {
        game,
        currentRound,
        isEnding,
        isSaving,
        isEnded,
        draft,
        finalResult,
        roundsToDisplay,
        submitRound,
        quitGame,
        submitEndGameBonus,
    } = useGameScores();

    const [modalRound, setModalRound] = useState<number | null>(null);
    const [modalEndGame, setModalEndGame] = useState(false);

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
            <GamePageHeader
                boardGameName={game.boardGameName}
                isSaving={isSaving}
                isEnding={isEnding}
                isEnded={isEnded}
                onEndRound={() => {
                    if (!isEnded) {
                        setModalRound(currentRound);
                    }
                }}
                onEndGame={() => {
                    if (!isEnded) {
                        setModalEndGame(true);
                    }
                }}
                onQuitGame={quitGame}
            />
            {finalResult && (
                <div className="mt-8">
                    <GameResultPanel result={finalResult} players={game.players ?? []} />
                </div>
            )}
            <div className="mt-8">
                <GameScoreTable
                    players={game.players ?? []}
                    roundsToDisplay={roundsToDisplay}
                    currentRound={currentRound}
                    draft={draft}
                    isSaving={isSaving}
                    isEnded={isEnded}
                    onEditPastRound={(roundNumber) => {
                        if (!isEnded) {
                            setModalRound(roundNumber);
                        }
                    }}
                />
            </div>

            {modalRound != null && !isEnded && (
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
            {modalEndGame && !isEnded && (
                <RoundScoreModal
                    title="Bonus de fin de partie"
                    players={game.players ?? []}
                    initialScores={fillScoresForPlayers(game.players ?? [], {})}
                    isSubmitting={isEnding}
                    onClose={() => setModalEndGame(false)}
                    onConfirm={async (scores) => {
                        const ok = await submitEndGameBonus(scores);
                        if (ok) {
                            setModalEndGame(false);
                        }
                    }}
                />
            )}
        </main>
    );
}
