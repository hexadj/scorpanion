export type CommittedPlayer =
    | { kind: 'user'; userId: string; name: string }
    | { kind: 'anonymous'; name: string };

export type PlayerInputRow = {
    id: string;
    text: string;
    committed: CommittedPlayer | null;
};

export function newEmptyRow(): PlayerInputRow {
    return { id: crypto.randomUUID(), text: '', committed: null };
}
