import { Button } from '@/components/ui/button';

type GamePageHeaderProps = {
  boardGameName: string;
  isSaving: boolean;
  isEnding: boolean;
  isEnded: boolean;
  onEndRound: () => void;
  onEndGame: () => void;
  onQuitGame: () => void;
};

export function GamePageHeader({
  boardGameName,
  isSaving,
  isEnding,
  isEnded,
  onEndRound,
  onEndGame,
  onQuitGame,
}: GamePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Score Board
        </h1>
        <p className="mt-2 text-xl font-medium text-foreground/90">{boardGameName}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        {isEnded ? (
          <Button
            type="button"
            onClick={onQuitGame}
            className="bg-sky-600 text-white hover:bg-sky-600/90"
          >
            Quitter la partie
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={isSaving}
              onClick={onEndRound}
              className="bg-sky-600 text-white hover:bg-sky-600/90"
            >
              Fin de manche
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isEnding}
              onClick={onEndGame}
            >
              Fin de partie
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
