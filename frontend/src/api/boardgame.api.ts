import type { BoardGame } from '@/models/types';

const MOCK_BOARDGAMES: BoardGame[] = [
    { id: 'bg-1', name: 'Les Aventuriers du Rail' },
    { id: 'bg-2', name: '7 Wonders' },
    { id: 'bg-3', name: 'Carcassonne' },
];

export function getBoardgames(): Promise<BoardGame[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_BOARDGAMES]), 400);
    });
}
