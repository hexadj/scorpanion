import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetGamesQuery } from '../services';
import type { Player, ResultEntryMode, SessionFormValues } from '../types';
import { RESULT_TYPES } from '../types';

const createSessionFormSchema = (resultEntryMode: ResultEntryMode) =>
  z.object({
    gameId: z.string().min(1, 'Sélectionnez un jeu avant de valider.'),
    playerResults: z
      .array(
        z
          .object({
            playerId: z.string(),
            playerName: z.string(),
            rank: z.string(),
            score: z.string(),
            isWinner: z.boolean(),
          })
          .superRefine((row, ctx) => {
            if (resultEntryMode === 'none') return;

            const rank = Number.parseInt(row.rank.trim(), 10);
            if (Number.isNaN(rank) || rank < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Rang requis (≥ 1)',
                path: ['rank'],
              });
            }

            if (resultEntryMode === 'score') {
              const score = Number.parseInt(row.score.trim(), 10);
              if (Number.isNaN(score)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Score requis',
                  path: ['score'],
                });
              }
            }
          }),
      )
      .min(1, 'Ajoutez au moins un joueur.'),
  });

export const useSessionForm = () => {
  const { data: games = [], isLoading: gamesLoading, isError: gamesError, error: gamesQueryError } =
    useGetGamesQuery();

  const resultEntryModeRef = useRef<ResultEntryMode>('none');

  const form = useForm<SessionFormValues>({
    resolver: async (values, context, options) => {
      const schema = createSessionFormSchema(resultEntryModeRef.current);
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: { gameId: '', playerResults: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'playerResults',
  });

  const selectedGameId = form.watch('gameId');

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId),
    [games, selectedGameId],
  );

  const resultEntryMode: ResultEntryMode = useMemo(() => {
    if (!selectedGameId || !selectedGame) return 'none';
    if (selectedGame.resultType === RESULT_TYPES.NO_SCORE) return 'no_score';
    if (
      selectedGame.resultType === RESULT_TYPES.HIGHEST_SCORE ||
      selectedGame.resultType === RESULT_TYPES.LOWEST_SCORE
    )
      return 'score';
    return 'none';
  }, [selectedGame, selectedGameId]);

  resultEntryModeRef.current = resultEntryMode;

  const prevGameIdRef = useRef(selectedGameId);
  useEffect(() => {
    if (prevGameIdRef.current !== selectedGameId) {
      const current = form.getValues('playerResults');
      current.forEach((_, i) => {
        form.setValue(`playerResults.${i}.rank`, '');
        form.setValue(`playerResults.${i}.score`, '');
        form.setValue(`playerResults.${i}.isWinner`, false);
      });
    }
    prevGameIdRef.current = selectedGameId;
  }, [selectedGameId, form]);

  const excludePlayerIds = useMemo(
    () => new Set(fields.map((f) => f.playerId)),
    [fields],
  );

  const addPlayer = useCallback(
    (player: Player) => {
      append({
        playerId: player.id,
        playerName: player.name,
        rank: '',
        score: '',
        isWinner: false,
      });
    },
    [append],
  );

  return {
    form,
    fields,
    addPlayer,
    removePlayer: remove,
    excludePlayerIds,
    games,
    gamesLoading,
    gamesError,
    gamesQueryError,
    selectedGameId,
    resultEntryMode,
  };
};
