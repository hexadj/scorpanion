export type SessionPlayerResult = {
  playerId: string;
  rank: number;
  isWinner: boolean;
  score?: number;
};

export type CreateSessionPlayerResultPayload = {
  playerId: string;
  rank: number | null;
  score?: number | null;
  isWinner: boolean;
};

export type CreateGameSessionPayload = {
  gameId: string;
  playedAt: string;
  playerResults: CreateSessionPlayerResultPayload[];
};

export type GameSession = {
  id: string;
  gameId: string;
  playedAt: string;
  results: SessionPlayerResult[];
};
