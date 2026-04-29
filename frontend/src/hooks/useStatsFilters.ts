import { useState } from 'react';
import type { StatsGlobalFilters } from '../types';

export type UseStatsFiltersResult = {
  filters: StatsGlobalFilters;
  setFrom: (from: string | undefined) => void;
  setTo: (to: string | undefined) => void;
  setGameId: (gameId: string | undefined) => void;
  setPlayerId: (playerId: string | undefined) => void;
};

export const useStatsFilters = (): UseStatsFiltersResult => {
  const [filters, setFilters] = useState<StatsGlobalFilters>({
    from: undefined,
    to: undefined,
    gameId: undefined,
    playerId: undefined,
  });

  return {
    filters,
    setFrom: (from) => setFilters((prev) => ({ ...prev, from })),
    setTo: (to) => setFilters((prev) => ({ ...prev, to })),
    setGameId: (gameId) => setFilters((prev) => ({ ...prev, gameId })),
    setPlayerId: (playerId) => setFilters((prev) => ({ ...prev, playerId })),
  };
};
