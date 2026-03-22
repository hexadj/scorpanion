import type { Player } from '@/models/types';
import { fillScoresForPlayers, isCellValueInvalid, validateScoresComplete } from '@/utils/gameScore.utils';
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

export function RoundScoreModal({
  title,
  players,
  initialScores,
  isSubmitting,
  onClose,
  onConfirm,
}: RoundScoreModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    fillScoresForPlayers(players, initialScores),
  );

  const canSubmit = validateScoresComplete(players, values) === null;

  function setPlayerValue(playerId: string, value: string) {
    setValues((prev) => ({ ...prev, [playerId]: value }));
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
            <div key={player.id} className="flex flex-col gap-2">
              <Label htmlFor={`score-${player.id}`}>{player.playerName}</Label>
              <Input
                id={`score-${player.id}`}
                type="text"
                inputMode="decimal"
                disabled={isSubmitting}
                value={values[player.id] ?? ''}
                onChange={(e) => setPlayerValue(player.id, e.target.value)}
                aria-invalid={isCellValueInvalid(values[player.id] ?? '')}
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
