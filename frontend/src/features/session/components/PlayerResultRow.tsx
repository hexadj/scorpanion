import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { ResultEntryMode, SessionFormValues } from '../types';

type PlayerResultRowProps = {
  index: number;
  control: Control<SessionFormValues>;
  resultEntryMode: ResultEntryMode;
};

const numericInputProps = {
  inputMode: 'numeric' as const,
  pattern: '[0-9]*',
};

export const PlayerResultRow = ({ index, control, resultEntryMode }: PlayerResultRowProps) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 1 }}
  >
    <Controller
      name={`playerResults.${index}.playerName`}
      control={control}
      render={({ field }) => (
        <TextField
          value={field.value}
          label="Joueur"
          slotProps={{ input: { readOnly: true } }}
          size="small"
          sx={{ flex: '1 1 140px', minWidth: 120 }}
        />
      )}
    />

    {resultEntryMode === 'score' ? (
      <Controller
        name={`playerResults.${index}.score`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Score"
            type="number"
            size="small"
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            sx={{ width: 88, flexShrink: 0 }}
            slotProps={{ htmlInput: numericInputProps }}
          />
        )}
      />
    ) : null}

    {resultEntryMode !== 'none' ? (
      <>
        <Controller
          name={`playerResults.${index}.rank`}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Rang"
              type="number"
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              sx={{ width: 72, flexShrink: 0 }}
              slotProps={{
                htmlInput: { ...numericInputProps, min: 1, step: 1 },
              }}
            />
          )}
        />
        <Controller
          name={`playerResults.${index}.isWinner`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} onChange={field.onChange} />}
              label="Gagnant"
              sx={{ flexShrink: 0, m: 0, width: 100, justifyContent: 'center' }}
            />
          )}
        />
      </>
    ) : null}
  </Stack>
);
