import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Game } from '../types';

type SessionGameSelectProps = {
  games: Game[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  selectedGameId: string;
  onSelectChange: (event: SelectChangeEvent<string>) => void;
  onOpenCreateModal: () => void;
};

export const SessionGameSelect = ({
  games,
  isLoading,
  isError,
  errorMessage,
  selectedGameId,
  onSelectChange,
  onOpenCreateModal,
}: SessionGameSelectProps) => (
  <>
    {isLoading ? <CircularProgress aria-label="Chargement des jeux" /> : null}
    {isError ? <Alert severity="error">{errorMessage}</Alert> : null}
    {!isLoading && !isError ? (
      <>
        <FormControl fullWidth>
          <InputLabel id="session-game-label">Jeu</InputLabel>
          <Select
            labelId="session-game-label"
            id="session-game-select"
            value={selectedGameId}
            label="Jeu"
            onChange={onSelectChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>Sélectionner un jeu</em>
            </MenuItem>
            {games.map((game) => (
              <MenuItem key={game.id} value={game.id}>
                {game.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={onOpenCreateModal}>
          Créer un jeu
        </Button>
      </>
    ) : null}
  </>
);
