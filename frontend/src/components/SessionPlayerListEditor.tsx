import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import {
  type AxiosBaseQueryError,
  useCreatePlayerMutation,
  useGetPlayersQuery,
} from '../services';
import type { Player } from '../types';
import { formatHttpError } from '../utils';

type SessionPlayerListEditorProps = {
  selectedPlayers: Player[];
  onSelectedPlayersChange: (players: Player[]) => void;
};

export const SessionPlayerListEditor = ({
  selectedPlayers,
  onSelectedPlayersChange,
}: SessionPlayerListEditorProps) => {
  const {
    data: players = [],
    isLoading: playersLoading,
    isError: playersError,
    error: playersQueryError,
  } = useGetPlayersQuery();
  const [createPlayer, { isLoading: isCreatingPlayer }] = useCreatePlayerMutation();

  const [playerDraft, setPlayerDraft] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [playerCreateError, setPlayerCreateError] = useState<string | null>(null);
  const [playerRowAnchorEl, setPlayerRowAnchorEl] = useState<HTMLElement | null>(null);

  const playersListErrorMessage =
    playersQueryError && typeof playersQueryError === 'object' && 'data' in playersQueryError
      ? String((playersQueryError as AxiosBaseQueryError).data)
      : 'Impossible de charger les joueurs.';

  const selectedIds = useMemo(
    () => new Set(selectedPlayers.map((p) => p.id)),
    [selectedPlayers],
  );

  const filteredPlayers = useMemo(() => {
    const q = playerDraft.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return players.filter(
      (p) => !selectedIds.has(p.id) && p.name.toLowerCase().includes(q),
    );
  }, [players, playerDraft, selectedIds]);

  const showSuggestions =
    suggestionsOpen &&
    playerDraft.trim().length > 0 &&
    !playersLoading &&
    !playersError;

  const handlePickPlayer = (player: Player) => {
    onSelectedPlayersChange([...selectedPlayers, player]);
    setPlayerDraft('');
    setPlayerCreateError(null);
    setSuggestionsOpen(false);
  };

  const handleCreatePlayerClick = async () => {
    const name = playerDraft.trim();
    if (name.length < 3) {
      return;
    }
    setPlayerCreateError(null);
    try {
      const created = await createPlayer({ name }).unwrap();
      onSelectedPlayersChange([...selectedPlayers, created]);
      setPlayerDraft('');
      setSuggestionsOpen(false);
    } catch (err) {
      const msg = formatHttpError(err);
      setPlayerCreateError(msg ?? 'Impossible de créer le joueur.');
    }
  };

  const createDisabled =
    playerDraft.trim().length < 3 || isCreatingPlayer || playersLoading || playersError;

  return (
    <>
      <Typography variant="h6" component="h2" sx={{ pt: 1 }}>
        Joueurs
      </Typography>
      {playersLoading ? (
        <CircularProgress size={28} aria-label="Chargement des joueurs" />
      ) : null}
      {playersError ? <Alert severity="error">{playersListErrorMessage}</Alert> : null}
      {!playersLoading && !playersError ? (
        <Stack spacing={2}>
          {selectedPlayers.map((p) => (
            <TextField
              key={p.id}
              value={p.name}
              fullWidth
              label="Joueur"
              slotProps={{ input: { readOnly: true } }}
              size="small"
            />
          ))}

          <ClickAwayListener onClickAway={() => setSuggestionsOpen(false)}>
            <Box ref={setPlayerRowAnchorEl}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  label="Joueur"
                  placeholder="Rechercher ou créer…"
                  value={playerDraft}
                  onChange={(e) => {
                    setPlayerDraft(e.target.value);
                    setPlayerCreateError(null);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => setSuggestionsOpen(true)}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  disabled={createDisabled}
                  onClick={() => void handleCreatePlayerClick()}
                  sx={{ flexShrink: 0, mt: 0.5, minWidth: 88 }}
                >
                  Créer
                </Button>
              </Stack>
              <Popper
                open={showSuggestions && filteredPlayers.length > 0}
                anchorEl={playerRowAnchorEl}
                placement="bottom-start"
                style={{
                  width: playerRowAnchorEl?.offsetWidth,
                  zIndex: 1300,
                }}
              >
                <Paper elevation={4} sx={{ maxHeight: 240, overflow: 'auto', mt: 0.5 }}>
                  <List dense disablePadding>
                    {filteredPlayers.map((p) => (
                      <ListItemButton key={p.id} onMouseDown={() => handlePickPlayer(p)}>
                        <ListItemText primary={p.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              </Popper>
            </Box>
          </ClickAwayListener>
          {playerCreateError ? (
            <Alert severity="error" onClose={() => setPlayerCreateError(null)}>
              {playerCreateError}
            </Alert>
          ) : null}
        </Stack>
      ) : null}
    </>
  );
};
