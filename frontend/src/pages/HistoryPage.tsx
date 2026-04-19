import { Alert, Autocomplete, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameSessionHistoryItem } from "../types";
import { useLazyGetGameSessionsQuery, useGetGamesQuery, useGetPlayersQuery } from "../services";

type Option = { id: string, name: string };

export const HistoryPage = () => {
    const [fetchHistory, { isFetching }] = useLazyGetGameSessionsQuery();

    const { data: games = [] } = useGetGamesQuery();
    const { data: players = [] } = useGetPlayersQuery();

    const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<GameSessionHistoryItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isSentinelVisible, setIsSentinelVisible] = useState(false);

    const latestRequestRef = useRef(0);
    const inFlightRef = useRef(false);
    const cursorRef = useRef<string | null>(null);
    const hasMoreRef = useRef(true);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadPage = useCallback(async (reset: boolean) => {
        if (!reset && inFlightRef.current) return;
        if (!reset && !hasMoreRef.current) return;

        const requestId = ++latestRequestRef.current;
        inFlightRef.current = true;

        if (reset) {
            setItems([]);
            setError(null);
            cursorRef.current = null;
            hasMoreRef.current = true;
            setHasMore(true);
        }

        try {
            const page = await fetchHistory({
                gameIds: selectedGameIds,
                playerIds: selectedPlayerIds,
                limit: 20,
                cursor: reset ? null : cursorRef.current,
            }).unwrap();

            if (requestId !== latestRequestRef.current) return;

            setItems(prev => (reset ? page.gameSessionsHistoryItems : [...prev, ...page.gameSessionsHistoryItems]));
            cursorRef.current = page.nextCursor;
            hasMoreRef.current = page.hasMore;
            setHasMore(page.hasMore);
            setError(null);
        } catch {
            if (requestId !== latestRequestRef.current) return;
            setError("Impossible de charger l'historique.");
        } finally {
            if (requestId === latestRequestRef.current) {
                inFlightRef.current = false;
            }
        }
    }, [fetchHistory, selectedGameIds, selectedPlayerIds]);

    const loadFirstPage = useCallback(async () => {
        await loadPage(true);
    }, [loadPage]);

    const loadNextPage = useCallback(async () => {
        await loadPage(false);
    }, [loadPage]);

    useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            entries => {
                setIsSentinelVisible(entries[0]?.isIntersecting ?? false);
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0,
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isSentinelVisible) return;
        if (isFetching) return;
        void loadNextPage();
    }, [isSentinelVisible, isFetching, loadNextPage]);

    return (
        <Box component="main" sx={{ px: 2, pb: 2, pt: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'sticky', top: 0, py: 2, backgroundColor: 'background.paper', zIndex: 1, borderBottom: '1px solid', borderColor: 'divider', }}>
                <Typography variant="h5" component="h1">
                    Historique
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Autocomplete<Option, true, false, false>
                        multiple
                        options={games}
                        value={games.filter(game => selectedGameIds.includes(game.id))}
                        onChange={(_, value) => setSelectedGameIds(value.map(game => game.id))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText="Aucun jeu trouvé"
                        renderInput={(params) => <TextField {...params} label="Game" />}
                    />
                    <Autocomplete<Option, true, false, false>
                        multiple
                        options={players}
                        value={players.filter(player => selectedPlayerIds.includes(player.id))}
                        onChange={(_, value) => setSelectedPlayerIds(value.map(player => player.id))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText="Aucun joueur trouvé"
                        renderInput={(params) => <TextField {...params} label="Player" />}
                    />
                    {error ? <Alert severity="error">{error}</Alert> : null}
                </Box>
            </Box>
            <Stack spacing={1} sx={{ mt: 2 }}>
                {items.map(historyItem => (
                    <Box key={historyItem.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body1">{new Date(historyItem.playedAt).toLocaleString()}</Typography>
                            <Typography variant="body1">{historyItem.gameName} - {historyItem.playerCount} joueurs</Typography>
                        </Box>
                        <Button variant="contained" size="small" color="primary">
                            <Typography variant="body2">Voir</Typography>
                        </Button>
                    </Box>
                ))}
            </Stack>

            {isFetching ? <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} /> : null}
            {!isFetching && !hasMore ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Fin de l'historique
                </Typography>
            ) : null}

            <Box ref={sentinelRef} sx={{ height: 1 }} />
        </Box>
    );
};
