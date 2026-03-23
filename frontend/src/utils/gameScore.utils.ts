import type { Game, Player, PlayerScore, Round } from '@/models/types';

/** Manche courante (1-based) : pas de champ serveur dédié — dérivée de l’historique. */
export function getCurrentRoundNumber(game: Game): number {
    return (game.rounds?.length ?? 0) + 1;
}

/** Clé stable pour lier une cellule du tableau (manche × joueur) à l’état local du formulaire. */
export function cellKey(roundNumber: number, playerId: string): string {
    return `${roundNumber}__${playerId}`;
}

/**
 * Parse une saisie utilisateur (virgule ou point). Chaîne vide ou invalide → `null`.
 */
export function parseScoreString(raw: string): number | null {
    const t = raw.trim();
    if (t === '') {
        return null;
    }
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}

/** Champ non vide mais qui ne parse pas en nombre fini (ex. saisie partielle). */
export function isCellValueInvalid(value: string): boolean {
    return value.trim() !== '' && parseScoreString(value) === null;
}

/**
 * Scores par id joueur : complète les entrées manquantes avec des chaînes vides.
 * Utilisable pour un brouillon issu du `draft` (cellKey) ou pour les valeurs initiales de la modale.
 */
export function fillScoresForPlayers(players: Player[], values: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const p of players) {
        out[p.id] = values[p.id] ?? '';
    }
    return out;
}

/**
 * Snapshot des champs du tableau aligné sur `game` (pour affichage / synchronisation).
 * Une Map par manche évite un `.find` répété sur `playersScores` pour chaque joueur.
 */
export function buildDraftSnapshotFromGame(game: Game, roundNumbers: number[]): Record<string, string> {
    const out: Record<string, string> = {};
    const history = game.rounds ?? [];
    const playerIds = (game.players ?? []).map((p) => p.id);
    for (const roundNumber of roundNumbers) {
        const round = history[roundNumber - 1];
        const byPlayer = new Map((round?.playersScores ?? []).map((ps) => [ps.playerId, ps.score]));

        for (const id of playerIds) {
            const key = cellKey(roundNumber, id);
            const score = byPlayer.get(id);
            out[key] = score == null ? '' : String(score);
        }
    }
    return out;
}

/** Valeurs par joueur pour une manche (clé = id joueur), alignées sur `draft` / `game`. */
export function scoresRecordForRound(
    game: Game,
    roundNumber: number,
    draft: Record<string, string>,
): Record<string, string> {
    const fromDraft: Record<string, string> = {};
    for (const p of game.players ?? []) {
        fromDraft[p.id] = draft[cellKey(roundNumber, p.id)] ?? '';
    }
    return fillScoresForPlayers(game.players ?? [], fromDraft);
}

/** Tous les joueurs listés doivent avoir un score numérique non vide. */
export function validateScoresComplete(players: Player[], scores: Record<string, string>): string | null {
    for (const p of players) {
        const raw = (scores[p.id] ?? '').trim();
        if (raw === '') {
            return `Score manquant pour ${p.playerName}.`;
        }
        if (parseScoreString(scores[p.id] ?? '') === null) {
            return `Score invalide pour ${p.playerName}.`;
        }
    }
    return null;
}

export function validateRoundComplete(game: Game, scores: Record<string, string>): string | null {
    return validateScoresComplete(game.players ?? [], scores);
}

export function buildCompleteRoundFromScores(
    roundNumber: number,
    players: Player[],
    scores: Record<string, string>,
): Round {
    const playersScores: PlayerScore[] = players.map((p) => {
        const raw = (scores[p.id] ?? '').trim();
        const n = parseScoreString(raw)!;
        return { playerId: p.id, score: n };
    });
    return { id: null, roundNumber, playersScores };
}

/** Somme des scores par joueur sur les manches données (brouillon texte ; vide ou invalide = ignoré). */
export function totalScoresByPlayer(
    players: Player[],
    roundNumbers: number[],
    draft: Record<string, string>,
): Record<string, number> {
    return Object.fromEntries(
        players.map((p) => [
            p.id,
            roundNumbers.reduce((sum, roundNumber) => {
                const raw = (draft[cellKey(roundNumber, p.id)] ?? '').trim();
                if (raw === '') {
                    return sum;
                }
                const n = parseScoreString(raw);
                return n != null ? sum + n : sum;
            }, 0),
        ]),
    );
}
