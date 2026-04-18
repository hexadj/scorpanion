import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { GameSession } from "../types";
import { useLazyGetGameSessionsQuery } from "../services";

export const HistoryPage = () => {
    const [fetchHistory, { isFetching }] = useLazyGetGameSessionsQuery();

    const [selectedGameIds] = useState<string[]>([]);
    const [selectedPlayerIds] = useState<string[]>([]);

    const [items, setItems] = useState<GameSession[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadNextPage = async (reset = false) => {
        if (isFetching) return;
        if (!reset && !hasMore) return;

        const page = await fetchHistory({
            gameIds: selectedGameIds,
            playerIds: selectedPlayerIds,
            limit: 20,
            cursor: reset ? null : cursor
        }).unwrap();

        setItems(prev => (reset ? page.gameSessions : [...prev, ...page.gameSessions]));
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
    };

    useEffect(() => {
        const loadFirstPage = async () => {
            const page = await fetchHistory({
                gameIds: selectedGameIds,
                playerIds: selectedPlayerIds,
                limit: 20,
                cursor: null,
            }).unwrap();

            setItems(page.gameSessions);
            setCursor(page.nextCursor);
            setHasMore(page.hasMore);
        };

        void loadFirstPage();
    }, [fetchHistory, selectedGameIds, selectedPlayerIds]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    void loadNextPage(false);
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 1.0,
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [loadNextPage]);

    return (
        <Box component="main" sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h1">
                Historique
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
                {items.map(session => (
                    <Box key={session.id}>{session.id}</Box>
                ))}
            </Stack>

            {isFetching ? <CircularProgress size={24} sx={{ mt: 2 }} /> : null}

            <Box ref={sentinelRef} sx={{ height: 1 }} />
        </Box>
    );
};