import type { Player } from '@/models/types';
import { cellKey, totalScoresByPlayer } from '@/utils/gameScore.utils';
import { useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[1%] whitespace-nowrap">Manche</TableHead>
          {players.map((player) => (
            <TableHead key={player.userId ?? player.playerName}>{player.playerName}</TableHead>
          ))}
          {!isEnded && (
            <TableHead className="w-14 text-center">
              <span className="sr-only">Modifier la manche</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {roundsToDisplay.map((roundNumber) => {
          const isPastRound = roundNumber < currentRound;

          return (
            <TableRow key={roundNumber}>
              <TableCell className="whitespace-nowrap font-medium">{roundNumber}</TableCell>
              {players.map((player) => {
                const key = cellKey(roundNumber, player.id);
                const value = (draft[key] ?? '').trim();

                return (
                  <TableCell
                    key={`${roundNumber}-${player.id}`}
                    className="whitespace-normal"
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
                <TableCell className="text-center align-middle">
                  {isPastRound ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
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
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold">Total</TableCell>
          {players.map((player) => (
            <TableCell key={`total-${player.id}`} className="font-semibold">
              {totalsByPlayer[player.id] ?? 0}
            </TableCell>
          ))}
          {!isEnded && <TableCell aria-hidden />}
        </TableRow>
      </TableFooter>
    </Table>
  );
}
