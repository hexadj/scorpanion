/**
 * Une ligne : champ texte + liste d’actions (anonyme / comptes filtrés) + suppression si joueur validé.
 * Styles : brouillon (pointillés), validé (primary), édition non confirmée (ambre).
 */
import { useMemo, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { User } from '@/models/types';
import { CircleUserRound, Trash2 } from 'lucide-react';
import type { PlayerInputRow } from './types';
import { filterUsersMatchingQuery, getPlayerRowUiState } from './playerRows.utils';

/** Empêche le blur du champ avant le clic sur une option de la liste (sinon fermeture sans validation). */
function preventInputBlurOnMouseDown(e: MouseEvent) {
    e.preventDefault();
}

export type PlayerRowFieldProps = {
    row: PlayerInputRow;
    allUsers: User[];
    usersLoading: boolean;
    open: boolean;
    takenUserIds: Set<string>;
    onTextChange: (value: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    onCommitAnonymous: () => void;
    onCommitUser: (user: User) => void;
    onRemove: () => void;
};

export function PlayerRowField({
    row,
    allUsers,
    usersLoading,
    open,
    takenUserIds,
    onTextChange,
    onFocus,
    onBlur,
    onCommitAnonymous,
    onCommitUser,
    onRemove,
}: PlayerRowFieldProps) {
    const q = row.text.trim().toLowerCase();
    const { isDraft, namesMatch, isEditingCommitted } = getPlayerRowUiState(row);

    // Afficher la liste seulement si le champ a du contenu et qu’on peut encore valider un choix
    const showDropdown =
        open && q.length > 0 && (isDraft || isEditingCommitted);

    const matchingUsers = useMemo(
        () => filterUsersMatchingQuery(allUsers, q, takenUserIds),
        [allUsers, q, takenUserIds],
    );

    const canAddAnon = row.text.trim().length > 0;
    const isDbUser = row.committed?.kind === 'user';

    // Brouillon / validé / modification en attente de confirmation (voir PlayerSelection.handleRowBlur)
    const inputVariantClass = isDraft
        ? 'border-dashed border-muted-foreground/40 bg-muted/25 placeholder:text-muted-foreground/80 dark:bg-muted/20'
        : namesMatch
            ? 'border-primary/50 bg-primary/5 shadow-sm dark:bg-primary/10'
            : 'border-amber-500/55 bg-amber-500/8 ring-1 ring-amber-500/25 dark:bg-amber-500/10';

    return (
        <div className="relative flex items-start gap-2">
            <div className="relative min-w-0 flex-1">
                <Input
                    type="text"
                    autoComplete="off"
                    placeholder={isDraft ? 'Ajouter un joueur…' : ''}
                    value={row.text}
                    onChange={(e) => onTextChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={usersLoading}
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    title={
                        isDraft
                            ? 'Saisie en cours — validez via la liste ou un compte'
                            : isEditingCommitted
                                ? 'Modification non confirmée — choisissez dans la liste ou quittez le champ pour annuler'
                                : 'Joueur pris en compte dans la partie'
                    }
                    className={cn(inputVariantClass, isDbUser && 'pr-9')}
                />
                {isDbUser && (
                    <span
                        className="pointer-events-none absolute top-1/2 right-2 z-[1] -translate-y-1/2 text-muted-foreground"
                        title="Compte enregistré (base de données)"
                        aria-hidden
                    >
                        <CircleUserRound className="size-4 opacity-90" strokeWidth={1.75} />
                    </span>
                )}
                {showDropdown && (
                    <div
                        className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border py-1 shadow-md"
                        role="listbox"
                    >
                        <div className="border-border border-b px-1 pb-1">
                            <button
                                type="button"
                                role="option"
                                disabled={!canAddAnon || usersLoading}
                                className={cn(
                                    'hover:bg-muted w-full rounded-sm px-3 py-2 text-left text-sm',
                                    (!canAddAnon || usersLoading) && 'pointer-events-none opacity-50',
                                )}
                                onMouseDown={preventInputBlurOnMouseDown}
                                onClick={() => {
                                    if (canAddAnon && !usersLoading) {
                                        onCommitAnonymous();
                                    }
                                }}
                            >
                                Ajouter en tant qu&apos;anonyme
                            </button>
                        </div>
                        {usersLoading ? (
                            <p className="text-muted-foreground px-3 py-2 text-sm">Chargement…</p>
                        ) : matchingUsers.length === 0 ? (
                            <p className="text-muted-foreground px-3 py-2 text-sm">Aucun utilisateur correspondant.</p>
                        ) : (
                            <ul className="py-1">
                                {matchingUsers.map((u) => (
                                    <li key={u.id}>
                                        <button
                                            type="button"
                                            role="option"
                                            className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
                                            onMouseDown={preventInputBlurOnMouseDown}
                                            onClick={() => onCommitUser(u)}
                                        >
                                            {u.username}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
            {row.committed !== null && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground mt-0.5 shrink-0 hover:text-destructive"
                    aria-label="Retirer ce joueur"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onRemove}
                >
                    <Trash2 />
                </Button>
            )}
        </div>
    );
}
