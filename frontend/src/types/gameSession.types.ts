export type GameSessionPlayerScore = {
  playerId: string;
  score: number;
};

export type GameSession = {
  id: string;
  gameId: string;
  playedAt: string;
  scores: GameSessionPlayerScore[];
};
