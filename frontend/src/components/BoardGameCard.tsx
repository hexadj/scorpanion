import type { BoardGame } from '@/models/types';
import { Link } from 'react-router-dom';

type BoardGameCardProps = {
    boardGame: BoardGame;
};

export function BoardGameCard({ boardGame }: BoardGameCardProps) {
    return (
        <Link
            to={`/game/${boardGame.id}/create`}
            state={{ boardGameName: boardGame.name }}
            className="block rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
            <p className="text-lg font-semibold text-slate-900">{boardGame.name}</p>
        </Link>
    );
}
