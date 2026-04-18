import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateGamePayload, ResultType } from '../types';
import { RESULT_TYPES } from '../types';

const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  [RESULT_TYPES.NO_SCORE]: 'Sans score',
  [RESULT_TYPES.HIGHEST_SCORE]: 'Meilleur score',
  [RESULT_TYPES.LOWEST_SCORE]: 'Score le plus bas',
};

const createGameFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(120),
  resultType: z.enum([
    RESULT_TYPES.NO_SCORE,
    RESULT_TYPES.HIGHEST_SCORE,
    RESULT_TYPES.LOWEST_SCORE,
  ]),
});

type CreateGameFormValues = z.infer<typeof createGameFormSchema>;

export type CreateGameModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGamePayload) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

export const CreateGameModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: CreateGameModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGameFormValues>({
    resolver: zodResolver(createGameFormSchema),
    defaultValues: {
      name: '',
      resultType: RESULT_TYPES.HIGHEST_SCORE,
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Nouveau jeu</DialogTitle>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            name: values.name.trim(),
            resultType: values.resultType,
          });
        })}
        noValidate
      >
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nom du jeu"
                  required
                  fullWidth
                  autoFocus
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="resultType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.resultType)}>
                  <InputLabel id="create-game-result-type-label">Type de résultat</InputLabel>
                  <Select
                    {...field}
                    labelId="create-game-result-type-label"
                    label="Type de résultat"
                  >
                    {(Object.keys(RESULT_TYPES) as (keyof typeof RESULT_TYPES)[]).map((key) => {
                      const value = RESULT_TYPES[key];
                      return (
                        <MenuItem key={value} value={value}>
                          {RESULT_TYPE_LABELS[value]}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {errors.resultType ? (
                    <FormHelperText>{errors.resultType.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Créer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
