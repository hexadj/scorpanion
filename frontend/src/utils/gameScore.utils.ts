import type { Game, PlayerScore, Round } from '@/models/types';

/** Clé stable pour lier une cellule du tableau (manche × joueur) à l’état local du formulaire. */
export function cellKey(roundNumber: number, playerName: string): string {
    return `${roundNumber}__${playerName}`;
}

/** Lit le score serveur pour une manche donnée (roundHistory est indexé par numéro de manche 1-based). */
export function getScoreFromGame(game: Game, roundNumber: number, playerName: string): number | null {
    const round = game.roundHistory[roundNumber - 1];
    const score = round?.playersScores.find((playerScore) => playerScore.playerName === playerName);
    return score?.score ?? null;
}

/**
 * Snapshot des champs du tableau aligné sur `game` (pour affichage / synchronisation).
 * Une Map par manche évite un `.find` répété sur `playersScores` pour chaque joueur.
 */
export function buildDraftSnapshotFromGame(game: Game, roundNumbers: number[]): Record<string, string> {
    const out: Record<string, string> = {};
    const playerNames = game.players.map((p) => p.name);

    for (const roundNumber of roundNumbers) {
        const round = game.roundHistory[roundNumber - 1];
        const byPlayer = new Map((round?.playersScores ?? []).map((ps) => [ps.playerName, ps.score]));

        for (const name of playerNames) {
            const key = cellKey(roundNumber, name);
            const score = byPlayer.get(name);
            out[key] = score == null ? '' : String(score);
        }
    }
    return out;
}

/** Valeurs par joueur pour une manche (clé = nom du joueur), alignées sur `draft` / `game`. */
export function scoresRecordForRound(
    game: Game,
    roundNumber: number,
    draft: Record<string, string>,
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const p of game.players) {
        out[p.name] = draft[cellKey(roundNumber, p.name)] ?? '';
    }
    return out;
}

/** Tous les joueurs doivent avoir un score numérique non vide. */
export function validateRoundComplete(game: Game, scores: Record<string, string>): string | null {
    for (const p of game.players) {
        const raw = (scores[p.name] ?? '').trim();
        if (raw === '') {
            return `Score manquant pour ${p.name}.`;
        }
        const n = Number(raw.replace(',', '.'));
        if (!Number.isFinite(n)) {
            return `Score invalide pour ${p.name}.`;
        }
    }
    return null;
}

export function buildCompleteRoundFromScores(
    roundNumber: number,
    players: { name: string }[],
    scores: Record<string, string>,
): Round {
    const playersScores: PlayerScore[] = players.map((p) => {
        const raw = (scores[p.name] ?? '').trim();
        const n = Number(raw.replace(',', '.'));
        return { playerName: p.name, score: n };
    });
    return { roundNumber, playersScores };
}

export function isCellValueInvalid(value: string): boolean {
    const t = value.trim();
    return t !== '' && !Number.isFinite(Number(t.replace(',', '.')));
}

/** Somme des scores par joueur sur les manches données (brouillon texte ; vide ou invalide = ignoré). */
export function totalScoresByPlayer(
    players: { name: string }[],
    roundNumbers: number[],
    draft: Record<string, string>,
): Record<string, number> {
    return Object.fromEntries(
        players.map((p) => [
            p.name,
            roundNumbers.reduce((sum, roundNumber) => {
                const raw = (draft[cellKey(roundNumber, p.name)] ?? '').trim();
                if (raw === '') {
                    return sum;
                }
                const n = Number(raw.replace(',', '.'));
                return Number.isFinite(n) ? sum + n : sum;
            }, 0),
        ]),
    );
}
