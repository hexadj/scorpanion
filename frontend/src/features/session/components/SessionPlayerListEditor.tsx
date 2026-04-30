import { Stack, Typography } from '@mui/material';
import type { Control, FieldArrayWithId } from 'react-hook-form';
import type { Player, ResultEntryMode, SessionFormValues } from '../types';
import { PlayerResultsList } from './PlayerResultsList';
import { PlayerSearchInput } from '../../player/components/PlayerSearchInput';

type SessionPlayerListEditorProps = {
  fields: FieldArrayWithId<SessionFormValues, 'playerResults'>[];
  control: Control<SessionFormValues>;
  resultEntryMode: ResultEntryMode;
  onAddPlayer: (player: Player) => void;
  excludePlayerIds: Set<string>;
};

export const SessionPlayerListEditor = ({
  fields,
  control,
  resultEntryMode,
  onAddPlayer,
  excludePlayerIds,
}: SessionPlayerListEditorProps) => (
  <>
    <Typography variant="h6" component="h2" sx={{ pt: 1 }}>
      Joueurs
    </Typography>
    <Stack spacing={2}>
      <PlayerResultsList
        fields={fields}
        control={control}
        resultEntryMode={resultEntryMode}
      />
      <PlayerSearchInput excludeIds={excludePlayerIds} onPickPlayer={onAddPlayer} />
    </Stack>
  </>
);
