import { Typography } from '@mui/material';
import { PageContainer } from '../components';
import { DistributionDetailsSection } from '../components/stats/sections/DistributionDetailsSection';
import { DistributionGamesSection } from '../components/stats/sections/DistributionGamesSection';
import { RankingsSection } from '../components/stats/sections/RankingsSection';
import { TimeseriesSection } from '../components/stats/sections/TimeseriesSection';
import { StatsFilterBar } from '../components/stats/StatsFilterBar';
import { useStatsFilters } from '../hooks';
import { useGetGamesQuery, useGetPlayersQuery } from '../services';

export const StatsPage = () => {
  const { data: games = [] } = useGetGamesQuery();
  const { data: players = [] } = useGetPlayersQuery();
  const { filters, setGameId, setPlayerId, setFrom, setTo } = useStatsFilters();

  const selectedGame = games.find((g) => g.id === filters.gameId);

  return (
    <PageContainer maxWidth={1100}>
      <Typography variant="h5" component="h1" gutterBottom>
        Statistiques
      </Typography>
      <StatsFilterBar
        games={games}
        players={players}
        filters={filters}
        onGameChange={setGameId}
        onPlayerChange={setPlayerId}
        onFromChange={setFrom}
        onToChange={setTo}
      />
      <TimeseriesSection globalFilters={filters} />
      <RankingsSection globalFilters={filters} />
      <DistributionGamesSection globalFilters={filters} />
      <DistributionDetailsSection globalFilters={filters} selectedGame={selectedGame} />
    </PageContainer>
  );
};
