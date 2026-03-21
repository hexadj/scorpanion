import type { Player } from '@/models/types';
import { isCellValueInvalid } from '@/utils/gameScore.utils';
import { useState } from 'react';

type RoundScoreModalProps = {
    title: string;
    players: Player[];
    initialScores: Record<string, string>;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (scores: Record<string, string>) => void | Promise<void>;
};

function buildScoresState(players: Player[], initialScores: Record<string, string>): Record<string, string> {
    const next: Record<string, string> = {};
    for (const p of players) {
        next[p.name] = initialScores[p.name] ?? '';
    }
    return next;
}

export function RoundScoreModal({
    title,
    players,
    initialScores,
    isSubmitting,
    onClose,
    onConfirm,
}: RoundScoreModalProps) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        buildScoresState(players, initialScores),
    );

    const canSubmit = players.every((p) => {
        const raw = (values[p.name] ?? '').trim();
        return raw !== '' && !isCellValueInvalid(values[p.name] ?? '');
    });

    function setPlayerValue(name: string, value: string) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Fermer"
                className="absolute inset-0 bg-slate-900/50"
                onClick={() => !isSubmitting && onClose()}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="round-score-modal-title"
                className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            >
                <h2 id="round-score-modal-title" className="text-lg font-semibold text-slate-900">
                    {title}
                </h2>
                <form
                    className="mt-6 flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!canSubmit || isSubmitting) {
                            return;
                        }
                        void onConfirm(values);
                    }}
                >
                    {players.map((player) => (
                        <label key={player.id ?? player.name} className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-700">{player.name}</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                disabled={isSubmitting}
                                value={values[player.name] ?? ''}
                                onChange={(e) => setPlayerValue(player.name, e.target.value)}
                                className="rounded-md border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                aria-invalid={isCellValueInvalid(values[player.name] ?? '')}
                            />
                        </label>
                    ))}
                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Enregistrement…' : 'Valider'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
