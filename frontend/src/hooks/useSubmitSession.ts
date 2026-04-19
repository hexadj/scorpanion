import { useCallback, useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateGameSessionMutation } from '../services';
import type { ResultEntryMode, SessionFormValues } from '../types';
import { formatHttpError } from '../utils';

export const useSubmitSession = (
  form: UseFormReturn<SessionFormValues>,
  resultEntryMode: ResultEntryMode,
) => {
  const navigate = useNavigate();
  const [createGameSession, { isLoading: isSaving, reset: resetMutation }] =
    useCreateGameSessionMutation();

  const [error, setError] = useState<string | null>(null);

  const selectedGameId = form.watch('gameId');
  useEffect(() => {
    setError(null);
  }, [selectedGameId]);

  const submit = form.handleSubmit(async (values) => {
    setError(null);

    const rows = values.playerResults.map((pr) => ({
      playerId: pr.playerId,
      rank: Number.parseInt(pr.rank, 10),
      score: resultEntryMode === 'score' ? Number.parseInt(pr.score, 10) : null,
      isWinner: pr.isWinner,
    }));

    try {
      await createGameSession({
        gameId: values.gameId,
        playedAt: new Date().toISOString(),
        playerResults: rows,
      }).unwrap();
      resetMutation();
      form.reset();
      navigate('/');
    } catch (err) {
      const msg = formatHttpError(err);
      setError(msg ?? "Impossible d'enregistrer la session.");
    }
  });

  const clearError = useCallback(() => setError(null), []);

  return { submit, isSaving, error, clearError };
};
