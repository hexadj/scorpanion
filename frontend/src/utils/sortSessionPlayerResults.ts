import { RESULT_TYPES, type ResultType } from '../types/game.types';
import type { SessionPlayerResult } from '../types/gameSession.types';

export const sortSessionPlayerResults = (
  playerResults: SessionPlayerResult[],
  resultType: ResultType,
): SessionPlayerResult[] => {
  const rankNull = Number.POSITIVE_INFINITY;
  const isHighest = resultType === RESULT_TYPES.HIGHEST_SCORE;
  const isNoScore = resultType === RESULT_TYPES.NO_SCORE;
  const scoreNull = isHighest ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  const scoreSign = isHighest ? -1 : 1;

  return [...playerResults].sort((a, b) => {
    const rankCmp = (a.rank ?? rankNull) - (b.rank ?? rankNull);
    if (rankCmp !== 0) return rankCmp;

    const byName = a.playerName.localeCompare(b.playerName, 'fr');

    if (isNoScore) return byName;

    const scoreCmp = ((a.score ?? scoreNull) - (b.score ?? scoreNull)) * scoreSign;
    if (scoreCmp !== 0) return scoreCmp;

    return byName;
  });
};
