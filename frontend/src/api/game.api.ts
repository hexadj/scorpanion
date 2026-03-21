import type { Game, Player, Round } from "@/models/types";

// TODO(back): supprimer tout le bloc ci-dessous (état mock + helpers) au branchement du backend.
const MOCK_GAME_TEMPLATE: Game = {
    id: '123',
    boardGameId: 'bg-1',
    boardGameName: 'Les Aventuriers du Rail',
    scoreboardId: '123',
    players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
        { id: 'p3', name: 'Charlie' },
    ],
    nbRounds: null,
    currentRound: 4,
    roundHistory: [
        {
            roundNumber: 1,
            playersScores: [
                { playerName: 'Alice', score: 12 },
                { playerName: 'Bob', score: 9 },
            ],
        },
        {
            roundNumber: 2,
            playersScores: [
                { playerName: 'Alice', score: 8 },
                { playerName: 'Charlie', score: 11 },
            ],
        },
        {
            roundNumber: 3,
            playersScores: [{ playerName: 'Bob', score: 14 }],
        },
    ],
};

// TODO(back): supprimer — utilisé uniquement pour le mock en mémoire.
function cloneGame(game: Game): Game {
    return {
        ...game,
        players: game.players.map((p) => ({ ...p })),
        roundHistory: game.roundHistory.map((r) => ({
            ...r,
            playersScores: r.playersScores.map((ps) => ({ ...ps })),
        })),
    };
}

// TODO(back): supprimer — fusion locale des manches pour le mock uniquement.
function mergeRoundHistory(existing: Round[], updates: Round[]): Round[] {
    const byNumber = new Map<number, Round>();
    for (const r of existing) {
        byNumber.set(r.roundNumber, r);
    }
    for (const r of updates) {
        byNumber.set(r.roundNumber, r);
    }
    return [...byNumber.values()].sort((a, b) => a.roundNumber - b.roundNumber);
}

// TODO(back): supprimer — persistance mock entre getGame / updateGame.
let currentMockGame: Game = cloneGame(MOCK_GAME_TEMPLATE);

export type CreateGamePayload = {
    boardGameId: string;
    scoreboardId: string | null;
    roundsCount: number | null;
    players: Player[];
};

export type CreateGameResponse = {
    gameId: string;
};

// TODO(back): remplacer par l’appel HTTP réel (création de partie). Supprimer : setTimeout et l’ID mocké.
export function createGame(_payload: CreateGamePayload): Promise<CreateGameResponse> {
    // TODO(back): supprimer cette ligne au branchement HTTP.
    void _payload;
    return new Promise((resolve) => {
        setTimeout(() => resolve({ gameId: '123' }), 500);
    });
}

export type GameResponse = {
    game: Game;
};


// TODO(back): remplacer par l’appel HTTP réel (GET partie). Supprimer : setTimeout et cloneGame(currentMockGame).
export function getGame(_gameId: string): Promise<GameResponse> {
    // TODO(back): supprimer cette ligne au branchement HTTP.
    void _gameId;
    return new Promise((resolve) => {
        setTimeout(() => resolve({ game: cloneGame(currentMockGame) }), 500);
    });
}

export type UpdateGamePayload = {
    rounds: Round[];
};

// TODO(back): remplacer par l’appel HTTP réel (PATCH/PUT manches). Supprimer : setTimeout, mergeRoundHistory,
// mutation de currentMockGame, cloneGame ici, et la logique locale d’incrément de currentRound (l’API renverra le jeu à jour).
export function updateGame(_gameId: string, payload: UpdateGamePayload): Promise<GameResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // TODO(back): supprimer tout le corps mock ci-dessous au branchement HTTP.
            const mergedHistory = mergeRoundHistory(currentMockGame.roundHistory, payload.rounds);
            const completedCurrentRound = payload.rounds.some(
                (r) => r.roundNumber === currentMockGame.currentRound,
            );
            const nextCurrentRound = completedCurrentRound
                ? currentMockGame.currentRound + 1
                : currentMockGame.currentRound;

            currentMockGame = {
                ...currentMockGame,
                roundHistory: mergedHistory,
                currentRound: nextCurrentRound,
            };
            resolve({ game: cloneGame(currentMockGame) });
        }, 400);
    });
}

// TODO(back): remplacer par l’appel HTTP réel (fin de partie). Supprimer : setTimeout.
export function endGame(_gameId: string): Promise<void> {
    // TODO(back): supprimer cette ligne au branchement HTTP.
    void _gameId;
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 400);
    });
}