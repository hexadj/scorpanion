import { Autocomplete, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useGetGamesQuery, useGetPlayersQuery, useGetTimeseriesQuery } from '../../../services';
import type { StatsPeriod, StatsGlobalFilters, StatsMetric, StatsScope } from '../../../types';
import { STATS_SCOPES, STATS_SCOPE_LABELS, STATS_METRIC_LABELS, TIMESERIES_METRICS_BY_SCOPE, periodToInterval } from '../../../types';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';
import { TimeseriesChart } from '../TimeseriesChart';

type TimeseriesSectionProps = {
  globalFilters: StatsGlobalFilters;
  period: StatsPeriod;
};

export const TimeseriesSection = ({ globalFilters, period }: TimeseriesSectionProps) => {
  const interval = periodToInterval(period);
  const [scope, setScope] = useState<StatsScope>(STATS_SCOPES.GLOBAL);
  const [metric, setMetric] = useState<StatsMetric>('sessionCount');
  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const [playerId, setPlayerId] = useState<string | undefined>(undefined);

  const { data: games = [] } = useGetGamesQuery();
  const { data: players = [] } = useGetPlayersQuery();

  const availableMetrics = TIMESERIES_METRICS_BY_SCOPE[scope];

  const needsPlayerId = scope === STATS_SCOPES.PLAYER;
  const needsGameId =
    scope === STATS_SCOPES.GAME ||
    (['averageScore', 'minScore', 'maxScore'] as StatsMetric[]).includes(metric);

  const skip =
    (needsPlayerId && !playerId) ||
    (needsGameId && !gameId);

  const { data, isFetching, error } = useGetTimeseriesQuery(
    {
      metric,
      scope,
      interval,
      from: globalFilters.from,
      to: globalFilters.to,
      playerId,
      gameId,
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
        label="Métrique"
        value={metric}
        onChange={(e) => setMetric(e.target.value as StatsMetric)}
        sx={{ width: { xs: '100%', sm: 180 } }}
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
        label="Scope"
        value={scope}
        onChange={(e) => handleScopeChange(e.target.value as StatsScope)}
        sx={{ width: { xs: '100%', sm: 120 } }}
      >
        {Object.values(STATS_SCOPES).map((s) => (
          <MenuItem key={s} value={s}>
            {STATS_SCOPE_LABELS[s]}
          </MenuItem>
        ))}
      </TextField>
      {needsGameId && (
        <Autocomplete
          options={games}
          value={games.find((g) => g.id === gameId) ?? null}
          onChange={(_, value) => setGameId(value?.id)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Aucun jeu trouvé"
          renderInput={(params) => <TextField {...params} size="small" label="Jeu" />}
          sx={{ width: { xs: '100%', sm: 180 } }}
        />
      )}
      {needsPlayerId && (
        <Autocomplete
          options={players}
          value={players.find((p) => p.id === playerId) ?? null}
          onChange={(_, value) => setPlayerId(value?.id)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Aucun joueur trouvé"
          renderInput={(params) => <TextField {...params} size="small" label="Joueur" />}
          sx={{ width: { xs: '100%', sm: 180 } }}
        />
      )}
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
      controls={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%', alignItems: { xs: 'center', sm: 'flex-start' } }}>{controls}</Stack>}
      isLoading={isFetching}
    >
      {renderContent()}
    </StatsSectionCard>
  );
};
