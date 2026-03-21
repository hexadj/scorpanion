import type { BoardGame } from '@/models/types';

// TODO(back): supprimer MOCK_BOARDGAMES au branchement du backend.
const MOCK_BOARDGAMES: BoardGame[] = [
    { id: 'bg-1', name: 'Les Aventuriers du Rail' },
    { id: 'bg-2', name: '7 Wonders' },
    { id: 'bg-3', name: 'Carcassonne' },
];

// TODO(back): remplacer par l’appel HTTP réel (liste des jeux). Supprimer : setTimeout et la copie de MOCK_BOARDGAMES.
export function getBoardgames(): Promise<BoardGame[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_BOARDGAMES]), 400);
    });
}
