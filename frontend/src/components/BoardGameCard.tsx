import type { BoardGame } from '@/models/types';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type BoardGameCardProps = {
  boardGame: BoardGame;
};

export function BoardGameCard({ boardGame }: BoardGameCardProps) {
  return (
    <Link
      to={`/game/${boardGame.id}/create`}
      state={{ boardGameName: boardGame.name }}
      className="block transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Card className="shadow-sm transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{boardGame.name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
