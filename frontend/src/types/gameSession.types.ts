import type { ResultType } from "./game.types";

export type SessionPlayerResult = {
  playerId: string;
  playerName: string;
  rank: number | null;
  isWinner: boolean;
  score: number | null;
};

export type CreateSessionPlayerResultPayload = {
  playerId: string;
  rank: number | null;
  score: number | null;
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
  gameName: string;
  resultType: ResultType;
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
