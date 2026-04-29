import { MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import {
  useGetDistributionParticipationsQuery,
  useGetDistributionScoresQuery,
  useGetDistributionWinsQuery,
} from '../../../services';
import type { DistributionWinsParams, Game, StatsGlobalFilters } from '../../../types';
import { RESULT_TYPES } from '../../../types';
import { DistributionBarChart } from '../DistributionBarChart';
import { StatsSectionCard } from '../StatsSectionCard';
import { StatsEmptyState } from '../StatsEmptyState';
import { StatsErrorState } from '../StatsErrorState';

type DistributionDetailsSectionProps = {
  globalFilters: StatsGlobalFilters;
  selectedGame: Game | undefined;
};

type WinsParticipationsScope = DistributionWinsParams['scope'];

export const DistributionDetailsSection = ({ globalFilters, selectedGame }: DistributionDetailsSectionProps) => {
  const theme = useTheme();
  const [winsScope, setWinsScope] = useState<WinsParticipationsScope>('global');
  const [participationsScope, setParticipationsScope] = useState<WinsParticipationsScope>('global');

  const gameSupportsScores = selectedGame && selectedGame.resultType !== RESULT_TYPES.NO_SCORE;

  const skipScores = !globalFilters.gameId || !gameSupportsScores;
  const skipWins = winsScope === 'game' && !globalFilters.gameId;
  const skipParticipations = participationsScope === 'game' && !globalFilters.gameId;

  const {
    data: scoresData,
    isFetching: scoresFetching,
    error: scoresError,
  } = useGetDistributionScoresQuery(
    {
      scope: 'game',
      gameId: globalFilters.gameId ?? '',
      playerId: globalFilters.playerId,
      from: globalFilters.from,
      to: globalFilters.to,
      includeOthers: true,
    },
    { skip: skipScores },
  );

  const {
    data: winsData,
    isFetching: winsFetching,
    error: winsError,
  } = useGetDistributionWinsQuery(
    {
      scope: winsScope,
      gameId: globalFilters.gameId,
      from: globalFilters.from,
      to: globalFilters.to,
    },
    { skip: skipWins },
  );

  const {
    data: participationsData,
    isFetching: participationsFetching,
    error: participationsError,
  } = useGetDistributionParticipationsQuery(
    {
      scope: participationsScope,
      gameId: globalFilters.gameId,
      from: globalFilters.from,
      to: globalFilters.to,
    },
    { skip: skipParticipations },
  );

  const scopeSelect = (
    value: WinsParticipationsScope,
    onChange: (s: WinsParticipationsScope) => void,
  ) => (
    <TextField
      select
      size="small"
      label="Scope"
      value={value}
      onChange={(e) => onChange(e.target.value as WinsParticipationsScope)}
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="global">Global</MenuItem>
      <MenuItem value="game">Jeu</MenuItem>
    </TextField>
  );

  const renderScores = () => {
    if (!globalFilters.gameId) {
      return <StatsEmptyState message="Sélectionnez un jeu pour afficher la distribution des scores." />;
    }
    if (selectedGame && selectedGame.resultType === RESULT_TYPES.NO_SCORE) {
      return <StatsEmptyState message="Ce jeu ne supporte pas les scores." />;
    }
    if (scoresError) return <StatsErrorState error={scoresError} />;
    if (!scoresData || scoresData.rows.length === 0) return <StatsEmptyState />;

    const rows = scoresData.rows.map((row) => ({
      label: row.isOthers ? 'Autres' : (row.bucket?.label ?? ''),
      count: Number(row.count),
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} />;
  };

  const renderWins = () => {
    if (skipWins) {
      return <StatsEmptyState message="Sélectionnez un jeu pour ce scope." />;
    }
    if (winsError) return <StatsErrorState error={winsError} />;
    if (!winsData || winsData.rows.length === 0) return <StatsEmptyState />;

    const rows = winsData.rows.map((row) => ({
      label: row.bucket.label,
      count: Number(row.count),
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} />;
  };

  const renderParticipations = () => {
    if (skipParticipations) {
      return <StatsEmptyState message="Sélectionnez un jeu pour ce scope." />;
    }
    if (participationsError) return <StatsErrorState error={participationsError} />;
    if (!participationsData || participationsData.rows.length === 0) return <StatsEmptyState />;

    const rows = participationsData.rows.map((row) => ({
      label: row.bucket.label,
      count: Number(row.count),
      share: row.share,
    }));
    return <DistributionBarChart rows={rows} color={theme.palette.warning.main} />;
  };

  return (
    <>
      <StatsSectionCard
        title="Distribution des scores"
        isLoading={scoresFetching}
      >
        {renderScores()}
      </StatsSectionCard>

      <StatsSectionCard
        title="Distribution des victoires"
        controls={
          <Stack direction="row" spacing={1} alignItems="center">
            {winsData ? (
              <Typography variant="caption" color="text.secondary">
                {winsData.totalPlayerCount} joueurs
              </Typography>
            ) : null}
            {scopeSelect(winsScope, setWinsScope)}
          </Stack>
        }
        isLoading={winsFetching}
      >
        {renderWins()}
      </StatsSectionCard>

      <StatsSectionCard
        title="Distribution des participations"
        controls={
          <Stack direction="row" spacing={1} alignItems="center">
            {participationsData ? (
              <Typography variant="caption" color="text.secondary">
                {participationsData.totalPlayerCount} joueurs
              </Typography>
            ) : null}
            {scopeSelect(participationsScope, setParticipationsScope)}
          </Stack>
        }
        isLoading={participationsFetching}
      >
        {renderParticipations()}
      </StatsSectionCard>
    </>
  );
};
