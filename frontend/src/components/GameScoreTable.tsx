import type { Player } from '@/models/types';
import { cellKey, totalScoresByPlayer } from '@/utils/gameScore.utils';
import { useMemo } from 'react';

type GameScoreTableProps = {
    players: Player[];
    roundsToDisplay: number[];
    currentRound: number;
    draft: Record<string, string>;
    isSaving: boolean;
    onEditPastRound: (roundNumber: number) => void;
};

function EditRoundIcon() {
    return (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
        </svg>
    );
}

export function GameScoreTable({
    players,
    roundsToDisplay,
    currentRound,
    draft,
    isSaving,
    onEditPastRound,
}: GameScoreTableProps) {
    const totalsByPlayer = useMemo(
        () => totalScoresByPlayer(players, roundsToDisplay, draft),
        [players, roundsToDisplay, draft],
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse rounded-md border border-slate-300">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-700">
                            Manche
                        </th>
                        {players.map((player) => (
                            <th
                                key={player.id ?? player.name}
                                className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-700"
                            >
                                {player.name}
                            </th>
                        ))}
                        <th className="w-14 border border-slate-300 px-2 py-2 text-center text-sm font-semibold text-slate-700">
                            <span className="sr-only">Modifier la manche</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {roundsToDisplay.map((roundNumber) => {
                        const isPastRound = roundNumber < currentRound;

                        return (
                            <tr key={roundNumber}>
                                <td className="border border-slate-300 px-4 py-2 text-sm text-slate-800">
                                    {roundNumber}
                                </td>
                                {players.map((player) => {
                                    const key = cellKey(roundNumber, player.name);
                                    const value = (draft[key] ?? '').trim();

                                    return (
                                        <td
                                            key={`${roundNumber}-${player.id ?? player.name}`}
                                            className="border border-slate-300 px-4 py-2 text-sm text-slate-800"
                                        >
                                            {value === '' ? (
                                                <span className="text-slate-400">—</span>
                                            ) : (
                                                value
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="border border-slate-300 px-1 py-1 text-center align-middle">
                                    {isPastRound ? (
                                        <button
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => onEditPastRound(roundNumber)}
                                            className="inline-flex rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label={`Modifier la manche ${roundNumber}`}
                                        >
                                            <EditRoundIcon />
                                        </button>
                                    ) : (
                                        <span className="inline-block w-9" aria-hidden />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="bg-slate-50">
                    <tr>
                        <td className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                            Total
                        </td>
                        {players.map((player) => (
                            <td
                                key={`total-${player.id ?? player.name}`}
                                className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900"
                            >
                                {totalsByPlayer[player.name] ?? 0}
                            </td>
                        ))}
                        <td className="border border-slate-300 px-2 py-2" aria-hidden />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
