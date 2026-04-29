import { MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useGetTimeseriesQuery } from '../../../services';
import type { StatsGlobalFilters, StatsInterval, StatsMetric, StatsScope } from '../../../types';
import {
  STATS_INTERVAL_LABELS,
  STATS_INTERVALS,
  STATS_METRIC_LABELS,
  STATS_SCOPE_LABELS,
  STATS_SCOPES,
  TIMESERIES_METRICS_BY_SCOPE,
} from '../../../types';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';
import { TimeseriesChart } from '../TimeseriesChart';

type TimeseriesSectionProps = {
  globalFilters: StatsGlobalFilters;
};

export const TimeseriesSection = ({ globalFilters }: TimeseriesSectionProps) => {
  const [scope, setScope] = useState<StatsScope>(STATS_SCOPES.GLOBAL);
  const [interval, setInterval] = useState<StatsInterval>(STATS_INTERVALS.WEEK);
  const [metric, setMetric] = useState<StatsMetric>('sessionCount');

  const availableMetrics = TIMESERIES_METRICS_BY_SCOPE[scope];

  const needsPlayerId = scope === STATS_SCOPES.PLAYER;
  const needsGameId =
    scope === STATS_SCOPES.GAME ||
    (['averageScore', 'minScore', 'maxScore'] as StatsMetric[]).includes(metric);

  const skip =
    (needsPlayerId && !globalFilters.playerId) ||
    (needsGameId && !globalFilters.gameId);

  const { data, isFetching, error } = useGetTimeseriesQuery(
    {
      metric,
      scope,
      interval,
      from: globalFilters.from,
      to: globalFilters.to,
      playerId: globalFilters.playerId,
      gameId: globalFilters.gameId,
    },
    { skip },
  );

  const handleScopeChange = (newScope: StatsScope) => {
    const metrics = TIMESERIES_METRICS_BY_SCOPE[newScope];
    if (!metrics.includes(metric)) {
      setMetric(metrics[0]);
    }
    setScope(newScope);
  };

  const controls = (
    <>
      <TextField
        select
        size="small"
        label="Scope"
        value={scope}
        onChange={(e) => handleScopeChange(e.target.value as StatsScope)}
        sx={{ minWidth: 100 }}
      >
        {Object.values(STATS_SCOPES).map((s) => (
          <MenuItem key={s} value={s}>
            {STATS_SCOPE_LABELS[s]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Métrique"
        value={metric}
        onChange={(e) => setMetric(e.target.value as StatsMetric)}
        sx={{ minWidth: 160 }}
      >
        {availableMetrics.map((m) => (
          <MenuItem key={m} value={m}>
            {STATS_METRIC_LABELS[m]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Intervalle"
        value={interval}
        onChange={(e) => setInterval(e.target.value as StatsInterval)}
        sx={{ minWidth: 100 }}
      >
        {Object.values(STATS_INTERVALS).map((i) => (
          <MenuItem key={i} value={i}>
            {STATS_INTERVAL_LABELS[i]}
          </MenuItem>
        ))}
      </TextField>
    </>
  );

  const renderContent = () => {
    if (skip) {
      const missing = needsPlayerId ? 'un joueur' : 'un jeu';
      return <StatsEmptyState message={`Sélectionnez ${missing} pour afficher cette série.`} />;
    }
    if (error) return <StatsErrorState error={error} />;
    if (!data || data.series.length === 0) return <StatsEmptyState />;
    return <TimeseriesChart series={data.series} interval={interval} />;
  };

  return (
    <StatsSectionCard
      title="Évolution temporelle"
      controls={<Stack direction="row" spacing={1}>{controls}</Stack>}
      isLoading={isFetching}
    >
      {renderContent()}
    </StatsSectionCard>
  );
};
