export interface PlayerResult {
    id: string;
    gameResultId: string;
    playerId: string;
    gameName: string;
    finalScore: number;
    hasWon: boolean;
    rank: number;
    playedAt: string;
}

export interface GameResult {
    id: string;
    gameId: string;
    playerResults: PlayerResult[];
}
