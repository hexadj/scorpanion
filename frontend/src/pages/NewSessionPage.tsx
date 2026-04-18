import { Box, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useCallback, useState } from 'react';
import { CreateGameModal, SessionGameSelect, SessionPlayerListEditor } from '../components';
import {
  type AxiosBaseQueryError,
  useCreateGameMutation,
  useGetGamesQuery,
} from '../services';
import type { CreateGamePayload, Player } from '../types';
import { formatHttpError } from '../utils';

export const NewSessionPage = () => {
  const { data: games = [], isLoading, isError, error } = useGetGamesQuery();

  const [createGame, { isLoading: isCreating, reset: resetCreateMutation }] =
    useCreateGameMutation();

  const [selectedGameId, setSelectedGameId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedGameId(event.target.value);
  };

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

  const listErrorMessage =
    error && typeof error === 'object' && 'data' in error
      ? String((error as AxiosBaseQueryError).data)
      : 'Impossible de charger les jeux.';

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
