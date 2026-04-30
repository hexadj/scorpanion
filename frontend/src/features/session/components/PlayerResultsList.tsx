import { Stack, Typography } from '@mui/material';
import type { Control, FieldArrayWithId } from 'react-hook-form';
import type { ResultEntryMode, SessionFormValues } from '../types';
import { PlayerResultRow } from './PlayerResultRow';

type PlayerResultsListProps = {
  fields: FieldArrayWithId<SessionFormValues, 'playerResults'>[];
  control: Control<SessionFormValues>;
  resultEntryMode: ResultEntryMode;
};

export const PlayerResultsList = ({
  fields,
  control,
  resultEntryMode,
}: PlayerResultsListProps) => {
  if (fields.length === 0 || resultEntryMode === 'none') {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 1,
          rowGap: 0.5,
          pl: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, flex: 1 }}>
          Joueur
        </Typography>
        {resultEntryMode === 'score' ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ width: 88, textAlign: 'center', flexShrink: 0 }}
          >
            Score
          </Typography>
        ) : null}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ width: 72, textAlign: 'center', flexShrink: 0 }}
        >
          Rang
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ width: 100, textAlign: 'center', flexShrink: 0 }}
        >
          Gagnant
        </Typography>
      </Stack>

      {fields.map((field, index) => (
        <PlayerResultRow
          key={field.id}
          index={index}
          control={control}
          resultEntryMode={resultEntryMode}
        />
      ))}
    </>
  );
};
