import type { Game, Player, Round } from "@/models/types";
import { getApiBaseUrl } from "./api.utils";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export type CreateGamePayload = {
    boardGameId: string;
    scoreboardId: string | null;
    roundsCount: number | null;
    players: Player[];
};

export async function createGame(payload: CreateGamePayload): Promise<string> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/game/create`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            boardGameId: payload.boardGameId,
            scoreboardId: payload.scoreboardId,
            players: payload.players.map((p) => ({
                userId: p.userId,
                playerName: p.playerName,
            })),
        }),
    });
    if (!res.ok) {
        throw new Error(`Création de partie : ${res.status} ${res.statusText}`);
    }
    return await res.json();
}

export async function getGame(gameId: string): Promise<Game> {
    const base = getApiBaseUrl();
    const url = new URL(`${base}/game/get`);
    url.searchParams.set("gameId", gameId);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Chargement de partie : ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as Game;
}

export type UpdateGamePayload = {
    gameId: string;
    round: Round;
};

export async function updateGame(payload: UpdateGamePayload): Promise<Game> {
    const base = getApiBaseUrl();
    const roundModel = {
        gameId: payload.gameId,
        number: payload.round.roundNumber,
        scores: payload.round.playersScores.map((s) => ({
            playerId: s.playerId,
            score: s.score,
        })),
    }
    const res = await fetch(`${base}/game/update`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            round: roundModel,
        }),
    });
    if (!res.ok) {
        throw new Error(`Mise à jour de partie : ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as Game;
}

// TODO(back): remplacer par l’appel HTTP réel (fin de partie). Supprimer : setTimeout.
export function endGame(_gameId: string): Promise<void> {
    // TODO(back): supprimer cette ligne au branchement HTTP.
    void _gameId;
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 400);
    });
}
