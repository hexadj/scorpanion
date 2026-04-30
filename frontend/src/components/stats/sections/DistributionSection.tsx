import { Autocomplete, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import {
  useGetDistributionGamesQuery,
  useGetDistributionParticipationsQuery,
  useGetDistributionScoresQuery,
  useGetDistributionWinsQuery,
  useGetGamesQuery,
  useGetPlayersQuery,
} from '../../../services';
import type { StatsGlobalFilters } from '../../../types';
import { RESULT_TYPES } from '../../../types';
import { DistributionBarChart } from '../DistributionBarChart';
import { DistributionDonutChart } from '../DistributionDonutChart';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';

type DistributionScope = 'global' | 'player' | 'game';

type DistributionSectionProps = {
  globalFilters: StatsGlobalFilters;
};

export const DistributionSection = ({ globalFilters }: DistributionSectionProps) => {
  const theme = useTheme();
  const [scope, setScope] = useState<DistributionScope>('global');
  const [playerId, setPlayerId] = useState<string | undefined>(undefined);
  const [gameId, setGameId] = useState<string | undefined>(undefined);

  const { data: games = [] } = useGetGamesQuery();
  const { data: players = [] } = useGetPlayersQuery();
  const selectedGame = games.find((g) => g.id === gameId);

  const needsPlayer = scope === 'player';
  const needsGame = scope === 'game';

  const skipGamesDistribution = needsPlayer && !playerId;
  const skipScores = !gameId || selectedGame?.resultType === RESULT_TYPES.NO_SCORE;
  const skipWinsParticipations = needsGame && !gameId;

  const gamesDistributionScope = needsPlayer ? 'player' : 'global';
  const winsParticipationsScope = needsGame ? 'game' : 'global';

  const { data: gamesData, isFetching: gamesFetching, error: gamesError } = useGetDistributionGamesQuery(
    { scope: gamesDistributionScope, playerId, from: globalFilters.from, to: globalFilters.to, includeOthers: true },
    { skip: skipGamesDistribution || needsGame },
  );

  const { data: scoresData, isFetching: scoresFetching, error: scoresError } = useGetDistributionScoresQuery(
    { scope: 'game', gameId: gameId ?? '', from: globalFilters.from, to: globalFilters.to, includeOthers: true },
    { skip: skipScores },
  );

  const { data: winsData, isFetching: winsFetching, error: winsError } = useGetDistributionWinsQuery(
    { scope: winsParticipationsScope, gameId: needsGame ? gameId : undefined, from: globalFilters.from, to: globalFilters.to },
    { skip: skipWinsParticipations },
  );

  const { data: participationsData, isFetching: participationsFetching, error: participationsError } = useGetDistributionParticipationsQuery(
    { scope: winsParticipationsScope, gameId: needsGame ? gameId : undefined, from: globalFilters.from, to: globalFilters.to },
    { skip: skipWinsParticipations },
  );

  const handleScopeChange = (newScope: DistributionScope) => {
    setScope(newScope);
    setPlayerId(undefined);
    setGameId(undefined);
  };

  const renderGamesDistribution = () => {
    if (skipGamesDistribution) return <StatsEmptyState message="Sélectionnez un joueur pour afficher sa répartition." />;
    if (gamesError) return <StatsErrorState error={gamesError} />;
    if (!gamesData || gamesData.rows.length === 0) return <StatsEmptyState />;
    const rows = gamesData.rows.map((row) => ({
      label: row.isOthers ? 'Autres' : (row.game?.name ?? ''),
      count: row.sessionCount,
      share: row.share,
      isOthers: row.isOthers,
    }));
    return <DistributionDonutChart rows={rows} totalCount={gamesData.totalSessionCount} />;
  };

  const renderScores = () => {
    if (!gameId) return <StatsEmptyState message="Sélectionnez un jeu pour afficher la distribution des scores." />;
    if (selectedGame?.resultType === RESULT_TYPES.NO_SCORE) return <StatsEmptyState message="Ce jeu ne supporte pas les scores." />;
    if (scoresError) return <StatsErrorState error={scoresError} />;
    if (!scoresData || scoresData.rows.length === 0) return <StatsEmptyState />;
    const rows = scoresData.rows.map((row) => ({
      label: row.isOthers ? 'Autres' : (row.bucket?.label ?? ''),
      count: row.count,
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} />;
  };

  const renderWins = () => {
    if (skipWinsParticipations) return <StatsEmptyState message="Sélectionnez un jeu pour ce scope." />;
    if (winsError) return <StatsErrorState error={winsError} />;
    if (!winsData || winsData.rows.length === 0) return <StatsEmptyState />;
    const rows = winsData.rows.map((row) => ({
      label: row.bucket.label,
      count: row.count,
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} />;
  };

  const renderParticipations = () => {
    if (skipWinsParticipations) return <StatsEmptyState message="Sélectionnez un jeu pour ce scope." />;
    if (participationsError) return <StatsErrorState error={participationsError} />;
    if (!participationsData || participationsData.rows.length === 0) return <StatsEmptyState />;
    const rows = participationsData.rows.map((row) => ({
      label: row.bucket.label,
      count: row.count,
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} color={theme.palette.warning.main} />;
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <TextField
          select
          size="small"
          label="Scope"
          value={scope}
          onChange={(e) => handleScopeChange(e.target.value as DistributionScope)}
          sx={{ width: { xs: '100%', sm: 120 } }}
        >
          <MenuItem value="global">Global</MenuItem>
          <MenuItem value="player">Joueur</MenuItem>
          <MenuItem value="game">Jeu</MenuItem>
        </TextField>
        {needsPlayer && (
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
        {needsGame && (
          <Autocomplete
            options={games}
            value={selectedGame ?? null}
            onChange={(_, value) => setGameId(value?.id)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Aucun jeu trouvé"
            renderInput={(params) => <TextField {...params} size="small" label="Jeu" />}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
        )}
      </Stack>

      {!needsGame && (
        <StatsSectionCard title="Répartition des jeux" isLoading={gamesFetching}>
          {renderGamesDistribution()}
        </StatsSectionCard>
      )}

      {needsGame && (
        <StatsSectionCard title="Distribution des scores" isLoading={scoresFetching}>
          {renderScores()}
        </StatsSectionCard>
      )}

      {!needsPlayer && (
        <>
          <StatsSectionCard
            title="Distribution des victoires"
            controls={winsData ? (
              <Typography variant="caption" color="text.secondary">{winsData.totalPlayerCount} joueurs</Typography>
            ) : undefined}
            isLoading={winsFetching}
          >
            {renderWins()}
          </StatsSectionCard>

          <StatsSectionCard
            title="Distribution des participations"
            controls={participationsData ? (
              <Typography variant="caption" color="text.secondary">{participationsData.totalPlayerCount} joueurs</Typography>
            ) : undefined}
            isLoading={participationsFetching}
          >
            {renderParticipations()}
          </StatsSectionCard>
        </>
      )}
    </>
  );
};
