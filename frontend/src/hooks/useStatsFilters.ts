import { useCallback, useState } from 'react';
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

  const setFrom = useCallback((from: string | undefined) => setFilters((prev) => ({ ...prev, from })), []);
  const setTo = useCallback((to: string | undefined) => setFilters((prev) => ({ ...prev, to })), []);
  const setGameId = useCallback((gameId: string | undefined) => setFilters((prev) => ({ ...prev, gameId })), []);
  const setPlayerId = useCallback((playerId: string | undefined) => setFilters((prev) => ({ ...prev, playerId })), []);

  return { filters, setFrom, setTo, setGameId, setPlayerId };
};
