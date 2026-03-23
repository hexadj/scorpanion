import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown } from 'lucide-react';
import type { GameResult, Player } from '@/models/types';

type GameResultPanelProps = {
  result: GameResult;
  players: Player[];
};

export function GameResultPanel({ result, players }: GameResultPanelProps) {
  const nameByPlayerId = new Map(players.map((player) => [player.id, player.playerName]));
  const orderedResults = [...result.playerResults].sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return b.finalScore - a.finalScore;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fin de la partie</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[1%] whitespace-nowrap">Rang</TableHead>
              <TableHead>Joueur</TableHead>
              <TableHead>Score final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedResults.map((playerResult) => (
              <TableRow key={playerResult.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <span>{playerResult.rank}</span>
                    {playerResult.hasWon && <Crown className="size-4 text-amber-500" aria-label="Vainqueur" />}
                  </span>
                </TableCell>
                <TableCell>{nameByPlayerId.get(playerResult.playerId) ?? playerResult.playerId}</TableCell>
                <TableCell>{playerResult.finalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
