import type { Player } from "./player.types";

export interface PlayerScore {
    playerId: string;
    score: number;
}

export interface Round {
    id: string | null;
    roundNumber: number;
    playersScores: PlayerScore[];
}

export interface Game {
    id: string;
    boardGameId: string;
    boardGameName: string;
    scoreboardId: string;
    players: Player[];
    roundHistory: Round[];
}