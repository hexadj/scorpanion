import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import type { Game, Player, StatsGlobalFilters } from '../../types';

type StatsFilterBarProps = {
  games: Game[];
  players: Player[];
  filters: StatsGlobalFilters;
  onGameChange: (gameId: string | undefined) => void;
  onPlayerChange: (playerId: string | undefined) => void;
  onFromChange: (from: string | undefined) => void;
  onToChange: (to: string | undefined) => void;
};

const toIso = (dateString: string): string => `${dateString}T00:00:00Z`;

export const StatsFilterBar = ({
  games,
  players,
  filters,
  onGameChange,
  onPlayerChange,
  onFromChange,
  onToChange,
}: StatsFilterBarProps) => {
  const selectedGame = games.find((g) => g.id === filters.gameId) ?? null;
  const selectedPlayer = players.find((p) => p.id === filters.playerId) ?? null;

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        <TextField
          type="date"
          size="small"
          label="Du"
          InputLabelProps={{ shrink: true }}
          value={filters.from ? filters.from.split('T')[0] : ''}
          onChange={(e) => onFromChange(e.target.value ? toIso(e.target.value) : undefined)}
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="date"
          size="small"
          label="Au"
          InputLabelProps={{ shrink: true }}
          value={filters.to ? filters.to.split('T')[0] : ''}
          onChange={(e) => onToChange(e.target.value ? toIso(e.target.value) : undefined)}
          sx={{ minWidth: 150 }}
        />
        <Autocomplete<Game>
          options={games}
          value={selectedGame}
          onChange={(_, value) => onGameChange(value?.id)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Aucun jeu trouvé"
          renderInput={(params) => <TextField {...params} size="small" label="Jeu" />}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete<Player>
          options={players}
          value={selectedPlayer}
          onChange={(_, value) => onPlayerChange(value?.id)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="Aucun joueur trouvé"
          renderInput={(params) => <TextField {...params} size="small" label="Joueur" />}
          sx={{ minWidth: 200 }}
        />
      </Stack>
    </Box>
  );
};
