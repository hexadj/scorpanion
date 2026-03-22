import type { Player, User } from '@/models/types';
import type { CommittedPlayer, PlayerInputRow } from './types';
import { newEmptyRow } from './types';

/**
 * Transforme les lignes de saisie en payload API.
 * Une ligne en cours d’édition (texte ≠ joueur validé) n’impacte pas le résultat : seul `committed` compte.
 */
export function buildPlayersFromRows(rows: PlayerInputRow[]): Player[] {
    return rows
        .filter((r): r is PlayerInputRow & { committed: CommittedPlayer } => r.committed !== null)
        .map((r) => {
            if (r.committed.kind === 'user') {
                return { userId: r.committed.userId, id: r.id, playerName: r.committed.name };
            }
            return { userId: null, id: r.id, playerName: r.committed.name };
        });
}

/** Identifiants des comptes déjà validés sur d’autres lignes (pour filtrer la liste). */
export function collectTakenUserIds(rows: PlayerInputRow[], exceptRowId: string): Set<string> {
    const ids = new Set<string>();
    for (const r of rows) {
        if (r.id === exceptRowId) {
            continue;
        }
        if (r.committed?.kind === 'user') {
            ids.add(r.committed.userId);
        }
    }
    return ids;
}

/**
 * Applique une validation sur une ligne ; si c’était la dernière ligne, ajoute un brouillon vide.
 */
export function commitRowWithPlayer(
    prev: PlayerInputRow[],
    rowId: string,
    committed: CommittedPlayer,
    text: string,
): PlayerInputRow[] {
    const idx = prev.findIndex((r) => r.id === rowId);
    if (idx === -1) {
        return prev;
    }
    const next = [...prev];
    next[idx] = { ...next[idx], text, committed };
    if (idx === next.length - 1) {
        next.push(newEmptyRow());
    }
    return next;
}

/** Au blur : si le texte ne correspond plus au joueur validé, on revient au nom enregistré. */
export function revertRowTextIfUncommitted(row: PlayerInputRow): PlayerInputRow {
    if (row.committed === null) {
        return row;
    }
    if (row.text.trim() === row.committed.name.trim()) {
        return row;
    }
    return { ...row, text: row.committed.name };
}

/** État d’affichage d’une ligne (brouillon / validé / édition non confirmée). */
export function getPlayerRowUiState(row: PlayerInputRow) {
    const isDraft = row.committed === null;
    const namesMatch =
        row.committed !== null && row.text.trim() === row.committed.name.trim();
    const isEditingCommitted = row.committed !== null && !namesMatch;
    return { isDraft, namesMatch, isEditingCommitted };
}

export function filterUsersMatchingQuery(
    allUsers: User[],
    queryTrimmedLower: string,
    takenUserIds: Set<string>,
): User[] {
    if (!queryTrimmedLower) {
        return [];
    }
    return allUsers.filter(
        (u) => u.username.toLowerCase().includes(queryTrimmedLower) && !takenUserIds.has(u.id),
    );
}
