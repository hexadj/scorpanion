import type { Game, Player } from "@/models/types";

export type CreateGamePayload = {
    playersCount: number;
    roundsCount: number;
    scoreboardId: string | null;
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
        setTimeout(() => resolve({ game: { id: '123', boardGameId: '123', scoreboardId: '123', players: [], nbRounds: null, currentRound: 0, roundHistory: [] } }), 500);
    });
}