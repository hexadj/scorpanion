import { MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useGetRankingsPlayersQuery } from '../../../services';
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

  const needsGameId = metric === 'averageScore';
  const skip = needsGameId && !globalFilters.gameId;

  const { data, isFetching, error } = useGetRankingsPlayersQuery(
    {
      metric,
      from: globalFilters.from,
      to: globalFilters.to,
      gameId: globalFilters.gameId,
      limit,
      offset,
    },
    { skip },
  );

  const handleMetricChange = (newMetric: StatsMetric) => {
    setMetric(newMetric);
    setOffset(0);
  };

  const controls = (
    <TextField
      select
      size="small"
      label="Métrique"
      value={metric}
      onChange={(e) => handleMetricChange(e.target.value as StatsMetric)}
      sx={{ minWidth: 160 }}
    >
      {RANKING_METRICS.map((m) => (
        <MenuItem key={m} value={m}>
          {STATS_METRIC_LABELS[m]}
        </MenuItem>
      ))}
    </TextField>
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
      controls={<Stack direction="row" spacing={1}>{controls}</Stack>}
      isLoading={isFetching}
    >
      {renderContent()}
    </StatsSectionCard>
  );
};
