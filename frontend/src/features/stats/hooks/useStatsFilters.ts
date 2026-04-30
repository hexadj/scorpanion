import { useMemo, useState } from 'react';
import type { StatsPeriod, StatsGlobalFilters } from '../types';
import { periodToDates } from '../types';

export type UseStatsFiltersResult = {
  filters: StatsGlobalFilters;
  period: StatsPeriod;
  setPeriod: (period: StatsPeriod) => void;
};

export const useStatsFilters = (): UseStatsFiltersResult => {
  const [period, setPeriod] = useState<StatsPeriod>('all');

  const filters = useMemo<StatsGlobalFilters>(() => periodToDates(period), [period]);

  return { filters, period, setPeriod };
};
