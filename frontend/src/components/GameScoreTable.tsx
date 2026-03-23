import type { Player } from '@/models/types';
import { cellKey, totalScoresByPlayer } from '@/utils/gameScore.utils';
import { useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type GameScoreTableProps = {
  players: Player[];
  roundsToDisplay: number[];
  currentRound: number;
  draft: Record<string, string>;
  isSaving: boolean;
  isEnded: boolean;
  onEditPastRound: (roundNumber: number) => void;
};

export function GameScoreTable({
  players,
  roundsToDisplay,
  currentRound,
  draft,
  isSaving,
  isEnded,
  onEditPastRound,
}: GameScoreTableProps) {
  const totalsByPlayer = useMemo(
    () => totalScoresByPlayer(players, roundsToDisplay, draft),
    [players, roundsToDisplay, draft],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <Table className="border-collapse">
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className="w-[1%] whitespace-nowrap rounded-tl-lg bg-accent px-3 py-2.5 text-center font-medium text-foreground">
              Manche
            </TableHead>
            {players.map((player, playerIndex) => (
              <TableHead
                key={player.userId ?? player.playerName}
                className={cn(
                  'bg-accent px-3 py-2.5 text-center font-medium text-foreground',
                  playerIndex === players.length - 1 && isEnded && 'rounded-tr-lg',
                )}
              >
                {player.playerName}
              </TableHead>
            ))}
            {!isEnded && (
              <TableHead className="w-14 rounded-tr-lg bg-accent px-2 py-2.5 text-center">
                <span className="sr-only">Modifier la manche</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {roundsToDisplay.map((roundNumber) => {
            const isPastRound = roundNumber < currentRound;
            const isCurrentRound = roundNumber === currentRound;

            return (
              <TableRow
                key={roundNumber}
                className={cn(
                  'border-0',
                  isCurrentRound ? 'hover:bg-transparent' : 'hover:bg-muted/20',
                )}
              >
                <TableCell
                  className={cn(
                    'whitespace-nowrap border-0 text-center font-medium',
                    isCurrentRound
                      ? 'bg-score-table-highlight text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {roundNumber}
                </TableCell>
                {players.map((player, playerIndex) => {
                  const key = cellKey(roundNumber, player.id);
                  const value = (draft[key] ?? '').trim();
                  const isLastPlayerCol = playerIndex === players.length - 1;
                  const roundEndRight = isCurrentRound && isEnded && isLastPlayerCol;

                  return (
                    <TableCell
                      key={`${roundNumber}-${player.id}`}
                      className={cn(
                        'border-0 whitespace-normal text-center text-foreground',
                        isCurrentRound && 'bg-score-table-highlight',
                        roundEndRight,
                      )}
                    >
                      {value === '' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
                {!isEnded && (
                  <TableCell
                    className={cn(
                      'border-0 text-center align-middle',
                      isCurrentRound && ' bg-score-table-highlight',
                    )}
                  >
                    {isPastRound ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-foreground hover:bg-primary/15 hover:text-foreground"
                        disabled={isSaving}
                        onClick={() => onEditPastRound(roundNumber)}
                        aria-label={`Modifier la manche ${roundNumber}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    ) : (
                      <span className="inline-block w-9" aria-hidden />
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="border-t-0 bg-transparent">
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="rounded-bl-lg bg-primary px-3 py-2.5 text-center font-semibold text-primary-foreground">
              Total
            </TableCell>
            {players.map((player, playerIndex) => (
              <TableCell
                key={`total-${player.id}`}
                className={cn(
                  'border-0 bg-primary px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-primary-foreground',
                  playerIndex === players.length - 1 && isEnded && 'rounded-br-lg',
                )}
              >
                {totalsByPlayer[player.id] ?? 0}
              </TableCell>
            ))}
            {!isEnded && (
              <TableCell className="w-14 rounded-br-lg border-0 bg-primary" aria-hidden />
            )}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
