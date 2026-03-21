import type { Game, Player } from "@/models/types";

export type CreateGamePayload = {
    boardGameId: string;
    scoreboardId: string | null;
    roundsCount: number | null;
    players: Player[];
};

export type CreateGameResponse = {
    gameId: string;
};

export function createGame(_payload: CreateGamePayload): Promise<CreateGameResponse> {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ gameId: '123' }), 500);
    });
}

export type GameResponse = {
    game: Game;
};


export function getGame(_gameId: string): Promise<GameResponse> {
    return new Promise((resolve) => {
        setTimeout(
            () =>
                resolve({
                    game: {
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
                                playersScores: [
                                    { playerName: 'Alice', score: 12 },
                                    { playerName: 'Bob', score: 9 },
                                ],
                            },
                            {
                                playersScores: [
                                    { playerName: 'Alice', score: 8 },
                                    { playerName: 'Charlie', score: 11 },
                                ],
                            },
                            {
                                playersScores: [{ playerName: 'Bob', score: 14 }],
                            },
                        ],
                    },
                }),
            500,
        );
    });
}


export function endGame(_gameId: string): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 400);
    });
}