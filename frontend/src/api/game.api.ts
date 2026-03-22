import type { Game, Player, Round } from "@/models/types";
import { getApiBaseUrl } from "./api.utils";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

// TODO(back): supprimer tout le bloc ci-dessous (état mock + helpers) au branchement du backend.
const MOCK_GAME_TEMPLATE: Game = {
    id: '123',
    boardGameId: 'bg-1',
    boardGameName: 'Les Aventuriers du Rail',
    scoreboardId: '123',
    players: [
        { userId: 'p1', playerName: 'Alice' },
        { userId: 'p2', playerName: 'Bob' },
        { userId: 'p3', playerName: 'Charlie' },
    ],
    roundHistory: [
        {
            roundNumber: 1,
            playersScores: [
                { playerName: 'Alice', score: 12 },
                { playerName: 'Bob', score: 9 },
            ],
        },
        {
            roundNumber: 2,
            playersScores: [
                { playerName: 'Alice', score: 8 },
                { playerName: 'Charlie', score: 11 },
            ],
        },
        {
            roundNumber: 3,
            playersScores: [{ playerName: 'Bob', score: 14 }],
        },
    ],
};

// TODO(back): supprimer — utilisé uniquement pour le mock en mémoire.
function cloneGame(game: Game): Game {
    return {
        ...game,
        players: (game.players ?? []).map((p) => ({ ...p })),
        roundHistory: (game.roundHistory ?? []).map((r) => ({
            ...r,
            playersScores: r.playersScores.map((ps) => ({ ...ps })),
        })),
    };
}

// TODO(back): supprimer — fusion locale des manches pour le mock uniquement.
function mergeRoundHistory(existing: Round[], updates: Round[]): Round[] {
    const byNumber = new Map<number, Round>();
    for (const r of existing) {
        byNumber.set(r.roundNumber, r);
    }
    for (const r of updates) {
        byNumber.set(r.roundNumber, r);
    }
    return [...byNumber.values()].sort((a, b) => a.roundNumber - b.roundNumber);
}

// TODO(back): supprimer — persistance mock entre getGame / updateGame.
let currentMockGame: Game = cloneGame(MOCK_GAME_TEMPLATE);

export type CreateGamePayload = {
    boardGameId: string;
    scoreboardId: string | null;
    roundsCount: number | null;
    players: Player[];
};

export type CreateGameResponse = {
    gameId: string;
};

export async function createGame(payload: CreateGamePayload): Promise<CreateGameResponse> {
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
    return (await res.json()) as CreateGameResponse;
}

export type GameResponse = {
    game: Game;
};

export async function getGame(gameId: string): Promise<GameResponse> {
    const base = getApiBaseUrl();
    const url = new URL(`${base}/game/get`);
    url.searchParams.set("gameId", gameId);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Chargement de partie : ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as GameResponse;
}

export type UpdateGamePayload = {
    rounds: Round[];
};

// TODO(back): remplacer par l’appel HTTP réel (PATCH/PUT manches). Supprimer : setTimeout, mergeRoundHistory,
// mutation de currentMockGame, cloneGame ici (l’API renverra le jeu à jour ; la manche courante se déduit de roundHistory).
export function updateGame(_gameId: string, payload: UpdateGamePayload): Promise<GameResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // TODO(back): supprimer tout le corps mock ci-dessous au branchement HTTP.
            const mergedHistory = mergeRoundHistory(currentMockGame.roundHistory, payload.rounds);
            currentMockGame = {
                ...currentMockGame,
                roundHistory: mergedHistory,
            };
            resolve({ game: cloneGame(currentMockGame) });
        }, 400);
    });
}

// TODO(back): remplacer par l’appel HTTP réel (fin de partie). Supprimer : setTimeout.
export function endGame(_gameId: string): Promise<void> {
    // TODO(back): supprimer cette ligne au branchement HTTP.
    void _gameId;
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 400);
    });
}