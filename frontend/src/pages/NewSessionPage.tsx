import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreateGameModal,
  SessionGameSelect,
  SessionPlayerListEditor,
  type SessionPlayerResultDraft,
} from '../components';
import {
  type AxiosBaseQueryError,
  useCreateGameMutation,
  useCreateGameSessionMutation,
  useGetGamesQuery,
} from '../services';
import type { CreateGamePayload, Player } from '../types';
import { RESULT_TYPES } from '../types';
import { formatHttpError } from '../utils';

type ResultEntryMode = 'none' | 'no_score' | 'score';

const emptyDraft = (): SessionPlayerResultDraft => ({
  rank: '',
  score: '',
  isWinner: false,
});

const parseIntStrict = (raw: string): number | null => {
  const t = raw.trim();
  if (t === '') {
    return null;
  }
  const n = Number.parseInt(t, 10);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
};

export const NewSessionPage = () => {
  const navigate = useNavigate();
  const { data: games = [], isLoading, isError, error } = useGetGamesQuery();

  const [createGame, { isLoading: isCreating, reset: resetCreateMutation }] =
    useCreateGameMutation();
  const [createGameSession, { isLoading: isSavingSession, reset: resetSessionMutation }] =
    useCreateGameSessionMutation();

  const [selectedGameId, setSelectedGameId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionSubmitError, setSessionSubmitError] = useState<string | null>(null);

  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [playerResults, setPlayerResults] = useState<Record<string, SessionPlayerResultDraft>>({});

  const prevGameIdRef = useRef(selectedGameId);

  useEffect(() => {
    setSessionSubmitError(null);
  }, [selectedGameId]);

  useEffect(() => {
    const gameChanged = prevGameIdRef.current !== selectedGameId;
    prevGameIdRef.current = selectedGameId;

    setPlayerResults((prev) => {
      const next: Record<string, SessionPlayerResultDraft> = {};
      for (const p of selectedPlayers) {
        next[p.id] = gameChanged ? emptyDraft() : (prev[p.id] ?? emptyDraft());
      }
      return next;
    });
  }, [selectedGameId, selectedPlayers]);

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId),
    [games, selectedGameId],
  );

  const resultEntryMode: ResultEntryMode = useMemo(() => {
    if (!selectedGameId || !selectedGame) {
      return 'none';
    }
    if (selectedGame.resultType === RESULT_TYPES.NO_SCORE) {
      return 'no_score';
    }
    if (
      selectedGame.resultType === RESULT_TYPES.HIGHEST_SCORE ||
      selectedGame.resultType === RESULT_TYPES.LOWEST_SCORE
    ) {
      return 'score';
    }
    return 'none';
  }, [selectedGame, selectedGameId]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedGameId(event.target.value);
  };

  const handlePlayerResultChange = useCallback(
    (playerId: string, update: Partial<SessionPlayerResultDraft>) => {
      setPlayerResults((prev) => {
        const current = prev[playerId] ?? emptyDraft();
        return {
          ...prev,
          [playerId]: { ...current, ...update },
        };
      });
    },
    [],
  );

  const formatCreateGameError = useCallback((err: unknown) => {
    const msg = formatHttpError(err);
    return msg ?? 'Impossible de créer le jeu.';
  }, []);

  const handleCreateGame = useCallback(
    async (payload: CreateGamePayload) => {
      setSubmitError(null);
      try {
        const game = await createGame(payload).unwrap();
        setModalOpen(false);
        resetCreateMutation();
        setSelectedGameId(game.id);
      } catch (err) {
        setSubmitError(formatCreateGameError(err));
      }
    },
    [createGame, formatCreateGameError, resetCreateMutation],
  );

  const handleCloseModal = () => {
    if (!isCreating) {
      setModalOpen(false);
      setSubmitError(null);
      resetCreateMutation();
    }
  };

  const handleValidateSession = useCallback(async () => {
    setSessionSubmitError(null);

    if (!selectedGameId || !selectedGame) {
      setSessionSubmitError('Sélectionnez un jeu avant de valider.');
      return;
    }
    if (selectedPlayers.length === 0) {
      setSessionSubmitError('Ajoutez au moins un joueur.');
      return;
    }

    const rows: {
      playerId: string;
      rank: number | null;
      score?: number | null;
      isWinner: boolean;
    }[] = [];

    for (const p of selectedPlayers) {
      const d = playerResults[p.id] ?? emptyDraft();
      const rank = parseIntStrict(d.rank);
      if (rank === null || rank < 1) {
        setSessionSubmitError(`Rang invalide ou manquant pour « ${p.name} ».`);
        return;
      }

      if (resultEntryMode === 'no_score') {
        rows.push({
          playerId: p.id,
          rank,
          score: null,
          isWinner: d.isWinner,
        });
      } else {
        const score = parseIntStrict(d.score);
        if (score === null) {
          setSessionSubmitError(`Score invalide ou manquant pour « ${p.name} ».`);
          return;
        }
        rows.push({
          playerId: p.id,
          rank,
          score,
          isWinner: d.isWinner,
        });
      }
    }

    try {
      await createGameSession({
        gameId: selectedGameId,
        playedAt: new Date().toISOString(),
        playerResults: rows,
      }).unwrap();
      resetSessionMutation();
      setSelectedGameId('');
      setSelectedPlayers([]);
      setPlayerResults({});
      navigate('/');
    } catch (err) {
      const msg = formatHttpError(err);
      setSessionSubmitError(msg ?? 'Impossible d’enregistrer la session.');
    }
  }, [
    createGameSession,
    navigate,
    playerResults,
    resetSessionMutation,
    resultEntryMode,
    selectedGame,
    selectedGameId,
    selectedPlayers,
  ]);

  const listErrorMessage =
    error && typeof error === 'object' && 'data' in error
      ? String((error as AxiosBaseQueryError).data)
      : 'Impossible de charger les jeux.';

  const canValidateSession =
    Boolean(selectedGameId) &&
    selectedPlayers.length > 0 &&
    resultEntryMode !== 'none' &&
    !isSavingSession;

  return (
    <Box component="main" sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nouvelle session
      </Typography>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <SessionGameSelect
          games={games}
          isLoading={isLoading}
          isError={isError}
          errorMessage={listErrorMessage}
          selectedGameId={selectedGameId}
          onSelectChange={handleSelectChange}
          onOpenCreateModal={() => setModalOpen(true)}
        />

        <SessionPlayerListEditor
          selectedPlayers={selectedPlayers}
          onSelectedPlayersChange={setSelectedPlayers}
          resultEntryMode={resultEntryMode}
          playerResults={playerResults}
          onPlayerResultChange={handlePlayerResultChange}
          belowSelectedPlayers={
            resultEntryMode === 'none' ? null : (
              <Stack spacing={2} sx={{ pt: 1 }}>
                {sessionSubmitError ? (
                  <Alert severity="error" onClose={() => setSessionSubmitError(null)}>
                    {sessionSubmitError}
                  </Alert>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!canValidateSession}
                  onClick={() => void handleValidateSession()}
                >
                  {isSavingSession ? 'Enregistrement…' : 'Valider la session'}
                </Button>
              </Stack>
            )
          }
        />
      </Stack>
      <CreateGameModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateGame}
        isSubmitting={isCreating}
        submitError={submitError}
      />
    </Box>
  );
};
