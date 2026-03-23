export interface PlayerResult {
    id: string;
    gameResultId: string;
    playerId: string;
    finalScore: number;
    hasWon: boolean;
    rank: number;
}

export interface GameResult {
    id: string;
    gameId: string;
    playerResults: PlayerResult[];
}
