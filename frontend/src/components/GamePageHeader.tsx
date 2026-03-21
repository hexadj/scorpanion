type GamePageHeaderProps = {
    boardGameName: string;
    isSaving: boolean;
    isEnding: boolean;
    onEndRound: () => void;
    onEndGame: () => void;
};

export function GamePageHeader({
    boardGameName,
    isSaving,
    isEnding,
    onEndRound,
    onEndGame,
}: GamePageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Score Board</h1>
                <p className="mt-2 text-xl font-medium text-slate-800">{boardGameName}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={onEndRound}
                    className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Fin de manche
                </button>
                <button
                    type="button"
                    disabled={isEnding}
                    onClick={() => void onEndGame()}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isEnding ? 'Arrêt…' : 'Arrêter la partie'}
                </button>
            </div>
        </div>
    );
}
