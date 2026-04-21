import { Alert, Autocomplete, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { GameSessionDetailsModal, PageContainer } from '../components';
import { useGameSessionHistory } from '../hooks';
import { useGetGamesQuery, useGetPlayersQuery } from '../services';

type Option = { id: string; name: string };

export const HistoryPage = () => {
    const { data: games = [] } = useGetGamesQuery();
    const { data: players = [] } = useGetPlayersQuery();

    const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [selectedGameSessionId, setSelectedGameSessionId] = useState<string | null>(null);

    const { items, hasMore, isFetching, retryAlert, sentinelRef } = useGameSessionHistory({
        gameIds: selectedGameIds,
        playerIds: selectedPlayerIds,
    });

    return (
        <PageContainer centered>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    py: 2,
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    width: '100%',
                }}
            >
                <Typography variant="h5" component="h1">
                    Historique
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Autocomplete<Option, true, false, false>
                        multiple
                        options={games}
                        value={games.filter((game) => selectedGameIds.includes(game.id))}
                        onChange={(_, value) => setSelectedGameIds(value.map((game) => game.id))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText="Aucun jeu trouvé"
                        renderInput={(params) => <TextField {...params} label="Game" />}
                    />
                    <Autocomplete<Option, true, false, false>
                        multiple
                        options={players}
                        value={players.filter((player) => selectedPlayerIds.includes(player.id))}
                        onChange={(_, value) => setSelectedPlayerIds(value.map((player) => player.id))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText="Aucun joueur trouvé"
                        renderInput={(params) => <TextField {...params} label="Player" />}
                    />
                </Box>
            </Box>

            <Stack spacing={1} sx={{ mt: 2, width: '100%' }}>
                {items.map((historyItem) => (
                    <Box
                        key={historyItem.id}
                        sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body1">{new Date(historyItem.playedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</Typography>
                            <Typography variant="body1">
                                {historyItem.gameName} - {historyItem.playerCount} joueurs
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => setSelectedGameSessionId(historyItem.id)}
                        >
                            <Typography variant="body2">Voir</Typography>
                        </Button>
                    </Box>
                ))}
            </Stack>

            <GameSessionDetailsModal
                gameSessionId={selectedGameSessionId}
                open={!!selectedGameSessionId}
                onClose={() => setSelectedGameSessionId(null)}
            />

            {isFetching ? <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} /> : null}

            {retryAlert ? (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={retryAlert.onRetry}>
                            Réessayer
                        </Button>
                    }
                >
                    {retryAlert.message}
                </Alert>
            ) : null}

            {!isFetching && !hasMore ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Fin de l'historique
                </Typography>
            ) : null}

            <Box ref={sentinelRef} sx={{ height: 1 }} />
        </PageContainer>
    );
};
