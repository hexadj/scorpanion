export const RESULT_TYPES = {
  NO_SCORE: 'NO_SCORE',
  HIGHEST_SCORE: 'HIGHEST_SCORE',
  LOWEST_SCORE: 'LOWEST_SCORE',
} as const;

export type ResultType = (typeof RESULT_TYPES)[keyof typeof RESULT_TYPES];

export type Game = {
  id: string;
  name: string;
  resultType: ResultType;
};

export type CreateGamePayload = {
  name: string;
  resultType: ResultType;
};

export type ResultEntryMode = 'none' | 'no_score' | 'score';
