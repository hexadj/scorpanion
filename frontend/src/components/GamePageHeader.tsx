import { Button } from '@/components/ui/button';

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
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Score Board
        </h1>
        <p className="mt-2 text-xl font-medium text-foreground/90">{boardGameName}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
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
          onClick={() => void onEndGame()}
        >
          {isEnding ? 'Arrêt…' : 'Arrêter la partie'}
        </Button>
      </div>
    </div>
  );
}
