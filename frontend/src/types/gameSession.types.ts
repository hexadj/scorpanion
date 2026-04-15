export type SessionPlayerResult = {
  playerId: string;
  rank: number;
  isWinner: boolean;
  score?: number;
};

export type GameSession = {
  id: string;
  gameId: string;
  playedAt: string;
  results: SessionPlayerResult[];
};
