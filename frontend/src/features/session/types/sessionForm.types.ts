export type SessionFormValues = {
  gameId: string;
  playerResults: {
    playerId: string;
    playerName: string;
    rank: string;
    score: string;
    isWinner: boolean;
  }[];
};
