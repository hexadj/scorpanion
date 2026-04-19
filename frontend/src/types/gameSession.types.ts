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
  playerResults: SessionPlayerResult[];
};

export type GetGameSessionHistoryPayload = {
  gameIds?: string[];
  playerIds?: string[];
  limit?: number;
  cursor?: string | null;
};

export type GameSessionHistoryItem = {
  id: string;
  playedAt: string;
  gameName: string;
  playerCount: number;
};

export type GameSessionHistoryPage = {
  gameSessionsHistoryItems: GameSessionHistoryItem[];
  nextCursor: string | null;
  hasMore: boolean;
};