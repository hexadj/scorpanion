import type { Player } from '@/models/types';
import { isCellValueInvalid } from '@/utils/gameScore.utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RoundScoreModalProps = {
  title: string;
  players: Player[];
  initialScores: Record<string, string>;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (scores: Record<string, string>) => void | Promise<void>;
};

function buildScoresState(players: Player[], initialScores: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {};
  for (const p of players) {
    next[p.name] = initialScores[p.name] ?? '';
  }
  return next;
}

export function RoundScoreModal({
  title,
  players,
  initialScores,
  isSubmitting,
  onClose,
  onConfirm,
}: RoundScoreModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildScoresState(players, initialScores),
  );

  const canSubmit = players.every((p) => {
    const raw = (values[p.name] ?? '').trim();
    return raw !== '' && !isCellValueInvalid(values[p.name] ?? '');
  });

  function setPlayerValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || isSubmitting) {
              return;
            }
            void onConfirm(values);
          }}
        >
          {players.map((player) => (
            <div key={player.id ?? player.name} className="flex flex-col gap-2">
              <Label htmlFor={`score-${player.id ?? player.name}`}>{player.name}</Label>
              <Input
                id={`score-${player.id ?? player.name}`}
                type="text"
                inputMode="decimal"
                disabled={isSubmitting}
                value={values[player.name] ?? ''}
                onChange={(e) => setPlayerValue(player.name, e.target.value)}
                aria-invalid={isCellValueInvalid(values[player.name] ?? '')}
              />
            </div>
          ))}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
            >
              {isSubmitting ? 'Enregistrement…' : 'Valider'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
