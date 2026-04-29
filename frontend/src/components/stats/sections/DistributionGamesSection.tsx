import { MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useGetDistributionGamesQuery } from '../../../services';
import type { StatsGlobalFilters } from '../../../types';
import { DistributionDonutChart } from '../DistributionDonutChart';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';

type DistributionGamesSectionProps = {
  globalFilters: StatsGlobalFilters;
};

type GamesDistributionScope = 'global' | 'player';

export const DistributionGamesSection = ({ globalFilters }: DistributionGamesSectionProps) => {
  const [scope, setScope] = useState<GamesDistributionScope>('global');

  const needsPlayerId = scope === 'player';
  const skip = needsPlayerId && !globalFilters.playerId;

  const { data, isFetching, error } = useGetDistributionGamesQuery(
    {
      scope,
      playerId: globalFilters.playerId,
      from: globalFilters.from,
      to: globalFilters.to,
      includeOthers: true,
    },
    { skip },
  );

  const controls = (
    <TextField
      select
      size="small"
      label="Scope"
      value={scope}
      onChange={(e) => setScope(e.target.value as GamesDistributionScope)}
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="global">Global</MenuItem>
      <MenuItem value="player">Joueur</MenuItem>
    </TextField>
  );

  const renderContent = () => {
    if (skip) {
      return <StatsEmptyState message="Sélectionnez un joueur pour afficher sa répartition." />;
    }
    if (error) return <StatsErrorState error={error} />;
    if (!data || data.rows.length === 0) return <StatsEmptyState />;

    const rows = data.rows.map((row) => ({
      label: row.isOthers ? 'Autres' : (row.game?.name ?? ''),
      count: row.sessionCount,
      share: row.share,
      isOthers: row.isOthers,
    }));

    return (
      <DistributionDonutChart rows={rows} totalCount={Number(data.totalSessionCount)} />
    );
  };

  return (
    <StatsSectionCard
      title="Répartition des jeux"
      controls={<Stack direction="row" spacing={1}>{controls}</Stack>}
      isLoading={isFetching}
    >
      {renderContent()}
    </StatsSectionCard>
  );
};
