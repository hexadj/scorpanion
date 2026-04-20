import {
  Alert,
  Box,
  Button,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useCreatePlayerMutation, useGetPlayersQuery } from '../services';
import type { Player } from '../types';
import { formatHttpError } from '../utils';

type PlayerSearchInputProps = {
  excludeIds: Set<string>;
  onPickPlayer: (player: Player) => void;
};

export const PlayerSearchInput = ({ excludeIds, onPickPlayer }: PlayerSearchInputProps) => {
  const { data: players = [], isLoading, isError } = useGetPlayersQuery();
  const [createPlayer, { isLoading: isCreatingPlayer }] = useCreatePlayerMutation();

  const [draft, setDraft] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return [];
    return players.filter((p) => !excludeIds.has(p.id) && p.name.toLowerCase().includes(q));
  }, [players, draft, excludeIds]);

  const showSuggestions =
    suggestionsOpen && draft.trim().length > 0 && !isLoading && !isError;

  const handlePick = (player: Player) => {
    onPickPlayer(player);
    setDraft('');
    setCreateError(null);
    setSuggestionsOpen(false);
  };

  const handleCreate = async () => {
    const name = draft.trim();
    if (name.length < 3) return;
    setCreateError(null);
    try {
      const created = await createPlayer({ name }).unwrap();
      onPickPlayer(created);
      setDraft('');
      setSuggestionsOpen(false);
    } catch (err) {
      const msg = formatHttpError(err);
      setCreateError(msg ?? 'Impossible de créer le joueur.');
    }
  };

  const createDisabled =
    draft.trim().length < 3 || isCreatingPlayer || isLoading || isError;

  return (
    <>
      <ClickAwayListener onClickAway={() => setSuggestionsOpen(false)}>
        <Box ref={setAnchorEl}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label="Joueur"
              placeholder="Rechercher ou créer…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setCreateError(null);
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
              onClick={() => void handleCreate()}
              sx={{ flexShrink: 0, mt: 0.5, minWidth: 88 }}
            >
              Créer
            </Button>
          </Stack>
          <Popper
            open={showSuggestions && filtered.length > 0}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
          >
            <Paper elevation={4} sx={{ maxHeight: 240, overflow: 'auto', mt: 0.5 }}>
              <List dense disablePadding>
                {filtered.map((p) => (
                  <ListItemButton key={p.id} onMouseDown={() => handlePick(p)}>
                    <ListItemText primary={p.name} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
      {createError ? (
        <Alert severity="error" onClose={() => setCreateError(null)}>
          {createError}
        </Alert>
      ) : null}
    </>
  );
};
