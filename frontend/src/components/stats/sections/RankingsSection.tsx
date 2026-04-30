import { Autocomplete, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetGamesQuery, useGetRankingsPlayersQuery } from '../../../services';
import type { StatsGlobalFilters, StatsMetric } from '../../../types';
import { RANKING_METRICS, STATS_METRIC_LABELS } from '../../../types';
import { RankingsTable } from '../RankingsTable';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';

type RankingsSectionProps = {
  globalFilters: StatsGlobalFilters;
};

const DEFAULT_LIMIT = 20;

export const RankingsSection = ({ globalFilters }: RankingsSectionProps) => {
  const [metric, setMetric] = useState<StatsMetric>('winRate');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [gameId, setGameId] = useState<string | undefined>(undefined);

  const { data: games = [] } = useGetGamesQuery();

  const needsGameId = metric === 'averageScore';
  const skip = needsGameId && !gameId;

  const { data, isFetching, error } = useGetRankingsPlayersQuery(
    {
      metric,
      from: globalFilters.from,
      to: globalFilters.to,
      gameId,
      limit,
      offset,
    },
    { skip },
  );

  useEffect(() => {
    setOffset(0);
  }, [globalFilters.from, globalFilters.to]);

  const handleMetricChange = (newMetric: StatsMetric) => {
    setMetric(newMetric);
    setOffset(0);
  };

  const controls = (
    <>
      <TextField
        select
        size="small"
        label="Métrique"
        value={metric}
        onChange={(e) => handleMetricChange(e.target.value as StatsMetric)}
        sx={{ width: { xs: '100%', sm: 160 } }}
      >
        {RANKING_METRICS.map((m) => (
          <MenuItem key={m} value={m}>
            {STATS_METRIC_LABELS[m]}
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
    </>
  );

  const renderContent = () => {
    if (skip) {
      return <StatsEmptyState message="Sélectionnez un jeu pour afficher ce classement." />;
    }
    if (error) return <StatsErrorState error={error} />;
    if (!data || data.rows.length === 0) return <StatsEmptyState />;
    return (
      <RankingsTable
        rows={data.rows}
        metric={metric}
        total={data.paging.total}
        limit={limit}
        offset={offset}
        onPageChange={(newOffset) => setOffset(newOffset)}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setOffset(0);
        }}
      />
    );
  };

  return (
    <StatsSectionCard
      title="Classement des joueurs"
      controls={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%', alignItems: { xs: 'center', sm: 'flex-start' } }}>{controls}</Stack>}
      isLoading={isFetching}
    >
      {renderContent()}
    </StatsSectionCard>
  );
};
