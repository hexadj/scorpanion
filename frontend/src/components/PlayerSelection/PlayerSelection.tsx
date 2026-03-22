/**
 * Bloc « joueurs » pour la création de partie : plusieurs lignes (texte + validation),
 * chargement des comptes, synchronisation du tableau `Player[]` vers le parent.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllUsers } from '@/api';
import { useNotification } from '@/hooks';
import { Label } from '@/components/ui/label';
import type { Player, User } from '@/models/types';
import type { PlayerInputRow } from './types';
import { newEmptyRow } from './types';
import {
    buildPlayersFromRows,
    collectTakenUserIds,
    commitRowWithPlayer,
    revertRowTextIfUncommitted,
} from './playerRows.utils';
import { PlayerRowField } from './PlayerRowField';

type PlayerSelectionProps = {
    onPlayersChange: (players: Player[]) => void;
};

export function PlayerSelection({ onPlayersChange }: PlayerSelectionProps) {
    const notification = useNotification();

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState<boolean>(true);
    const [rows, setRows] = useState<PlayerInputRow[]>(() => [newEmptyRow()]);
    /** Ligne dont la liste déroulante est ouverte (une seule à la fois). */
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    /** Délai avant fermeture au blur : laisse le temps de cliquer dans la liste (voir PlayerRowField). */
    const blurCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setUsersLoading(true);
            try {
                const list = await getAllUsers();
                if (!cancelled) {
                    setAllUsers(list);
                }
            } catch {
                if (!cancelled) {
                    setAllUsers([]);
                    notification.showError({
                        message: 'Impossible de charger la liste des utilisateurs.',
                    });
                }
            } finally {
                if (!cancelled) {
                    setUsersLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [notification]);

    useEffect(() => {
        return () => {
            if (blurCloseTimerRef.current) {
                clearTimeout(blurCloseTimerRef.current);
            }
        };
    }, []);

    const players = useMemo(() => buildPlayersFromRows(rows), [rows]);

    useEffect(() => {
        onPlayersChange(players);
    }, [players, onPlayersChange]);

    /** Valide le texte courant comme joueur anonyme ; si c’était la dernière ligne, en ajoute une vide. */
    function commitAnonymous(rowId: string) {
        setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === rowId);
            if (idx === -1) {
                return prev;
            }
            const name = prev[idx].text.trim();
            if (!name) {
                return prev;
            }
            return commitRowWithPlayer(prev, rowId, { kind: 'anonymous', name }, name);
        });
        setOpenRowId(null);
    }

    /** Attache un compte existant à la ligne ; même logique de nouvelle ligne vide en bas. */
    function commitUser(rowId: string, user: User) {
        setRows((prev) =>
            commitRowWithPlayer(
                prev,
                rowId,
                { kind: 'user', userId: user.id, name: user.username },
                user.username,
            ),
        );
        setOpenRowId(null);
    }

    /** Retire la ligne ; au minimum une ligne brouillon reste affichée. */
    function removeRow(rowId: string) {
        setRows((prev) => {
            const filtered = prev.filter((r) => r.id !== rowId);
            if (filtered.length === 0) {
                return [newEmptyRow()];
            }
            return filtered;
        });
        if (openRowId === rowId) {
            setOpenRowId(null);
        }
    }

    /** Saisie libre ; `committed` n’est pas effacé ici (annulation au blur si besoin). */
    function updateRowText(rowId: string, value: string) {
        setRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, text: value } : r)),
        );
    }

    /** Ouvre la liste pour cette ligne et annule une fermeture programmée au blur précédent. */
    function handleRowFocus(rowId: string) {
        if (blurCloseTimerRef.current) {
            clearTimeout(blurCloseTimerRef.current);
            blurCloseTimerRef.current = null;
        }
        setOpenRowId(rowId);
    }

    /**
     * Ferme la liste puis, si l’utilisateur a modifié le texte sans re-valider,
     * restaure le nom du joueur déjà pris en compte (`committed`).
     */
    function handleRowBlur(rowId: string) {
        blurCloseTimerRef.current = setTimeout(() => {
            setOpenRowId(null);
            setRows((prev) =>
                prev.map((r) => (r.id === rowId ? revertRowTextIfUncommitted(r) : r)),
            );
            blurCloseTimerRef.current = null;
        }, 150);
    }

    return (
        <div className="space-y-3">
            <Label className="text-base">Joueurs / joueuses</Label>
            <div className="flex flex-col gap-3">
                {rows.map((row) => (
                    <PlayerRowField
                        key={row.id}
                        row={row}
                        allUsers={allUsers}
                        usersLoading={usersLoading}
                        open={openRowId === row.id}
                        takenUserIds={collectTakenUserIds(rows, row.id)}
                        onTextChange={(v) => updateRowText(row.id, v)}
                        onFocus={() => handleRowFocus(row.id)}
                        onBlur={() => handleRowBlur(row.id)}
                        onCommitAnonymous={() => commitAnonymous(row.id)}
                        onCommitUser={(u) => commitUser(row.id, u)}
                        onRemove={() => removeRow(row.id)}
                    />
                ))}
            </div>
        </div>
    );
}
