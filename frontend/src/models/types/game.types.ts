import type { Player } from "./player.types";

export interface PlayerScore {
    playerName: string;
    score: number;
}

export interface Round {
    roundNumber: number;
    playersScores: PlayerScore[];
}

export interface Game {
    id: string;
    boardGameId: string;
    boardGameName: string;
    scoreboardId: string;
    players: Player[];
    nbRounds: number | null;
    currentRound: number;
    roundHistory: Round[];
}