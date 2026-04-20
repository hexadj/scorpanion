import { useCallback, useState } from 'react';
import { useCreateGameMutation } from '../services';
import type { CreateGamePayload } from '../types';
import { formatHttpError } from '../utils';

export const useCreateGameModal = (onGameCreated?: (gameId: string) => void) => {
  const [createGame, { isLoading: isCreating, reset: resetMutation }] =
    useCreateGameMutation();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => setOpen(true), []);

  const closeModal = useCallback(() => {
    if (!isCreating) {
      setOpen(false);
      setError(null);
      resetMutation();
    }
  }, [isCreating, resetMutation]);

  const handleSubmit = useCallback(
    async (payload: CreateGamePayload) => {
      setError(null);
      try {
        const game = await createGame(payload).unwrap();
        setOpen(false);
        resetMutation();
        onGameCreated?.(game.id);
      } catch (err) {
        const msg = formatHttpError(err);
        setError(msg ?? 'Impossible de créer le jeu.');
      }
    },
    [createGame, resetMutation, onGameCreated],
  );

  return { open, openModal, closeModal, handleSubmit, isCreating, error };
};
