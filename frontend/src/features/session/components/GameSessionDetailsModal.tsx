import { skipToken } from "@reduxjs/toolkit/query";
import { Alert, Box, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import type { ReactNode } from "react";
import { useGetGameSessionQuery } from "../services";
import { RESULT_TYPES } from "../types";
import { sortSessionPlayerResults } from "../utils";

type GameSessionDetailsModalProps = {
    gameSessionId: string | null;
    open: boolean;
    onClose: () => void;
};

export const GameSessionDetailsModal = ({ gameSessionId, open, onClose }: GameSessionDetailsModalProps) => {
    const { data: gameSession, isLoading, isError } = useGetGameSessionQuery(
        open && gameSessionId ? gameSessionId : skipToken
    );

    let body: ReactNode;
    if (isLoading) {
        body = <CircularProgress size={24} sx={{ display: "block", mx: "auto", mt: 1 }} />;
    } else if (isError) {
        body = <Alert severity="error">Erreur lors de la recuperation de la partie.</Alert>;
    } else if (!gameSession) {
        body = <Alert severity="warning">Aucun detail disponible pour cette partie.</Alert>;
    } else {
        const showScore = gameSession.resultType !== RESULT_TYPES.NO_SCORE;
        const sortedResults = sortSessionPlayerResults(gameSession.playerResults, gameSession.resultType);

        body = (
            <>
                <Typography variant="h6">{gameSession.gameName}</Typography>
                <Typography variant="h6">{new Date(gameSession.playedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</Typography>
                <Box>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {sortedResults.map((player) => (
                            <Box
                                key={player.playerId}
                                sx={{
                                    p: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    display: "grid",
                                    gridTemplateColumns: "56px 1fr 56px",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="body1" sx={{ textAlign: "center" }}>
                                    {player.rank ?? "-"}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                    {player.isWinner ? <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} /> : null}
                                    <Typography variant="body1">{player.playerName}</Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                    {showScore ? <Typography variant="body1">{player.score ?? "-"}</Typography> : null}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "95vw", sm: "80vw", md: "70vw" },
                        maxWidth: { xs: "95vw", sm: "80vw", md: "70vw" },
                    },
                },
            }}
        >
            <DialogTitle>Resultats de la partie</DialogTitle>
            <DialogContent>{body}</DialogContent>
        </Dialog>
    );
};
