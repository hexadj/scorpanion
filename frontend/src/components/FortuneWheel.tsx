import { useCallback, useMemo, useRef, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import type { WheelDataType } from 'react-custom-roulette';
import { Button } from '@/components/ui/button';

const DEFAULT_CATEGORIES = ['Perdu', 'Relance', '×2', 'Joker'];

const CATEGORY_STYLE_PALETTE: Array<{ backgroundColor: string; textColor: string }> = [
  { backgroundColor: '#64748b', textColor: '#ffffff' },
  { backgroundColor: '#3b82f6', textColor: '#ffffff' },
  { backgroundColor: '#22c55e', textColor: '#ffffff' },
  { backgroundColor: '#eab308', textColor: '#0f172a' },
  { backgroundColor: '#a855f7', textColor: '#ffffff' },
  { backgroundColor: '#f97316', textColor: '#ffffff' },
];

function categoriesToSegments(categories: string[]): WheelDataType[] {
  return categories.map((option, i) => ({
    option,
    style: CATEGORY_STYLE_PALETTE[i % CATEGORY_STYLE_PALETTE.length],
  }));
}

export type FortuneWheelProps = {
  /** Libellés des secteurs. Ignoré si `segments` est fourni et non vide. */
  categories?: string[];
  /** Données complètes (couleurs, images…). Prend le pas sur `categories` si défini et non vide. */
  segments?: WheelDataType[];
  onResult?: (index: number, label: string) => void;
  className?: string;
  /**
   * Multiplicateur de durée côté `react-custom-roulette` (défaut lib interne ≈ 1).
   * Plus la valeur est élevée, plus l’animation est longue (toutes les phases sont étirées).
   */
  spinDuration?: number;
  /**
   * Facteur de vitesse perçue : &gt; 1 = rotation plus rapide (durée effective réduite),
   * &lt; 1 = plus lent. Combiné avec `spinDuration` pour obtenir `spinDuration / rotationSpeed`.
   */
  rotationSpeed?: number;
};

export function FortuneWheel({
  categories,
  segments: segmentsProp,
  onResult,
  className,
  spinDuration = 1,
  rotationSpeed = 1,
}: FortuneWheelProps) {
  const resolvedCategories = categories ?? DEFAULT_CATEGORIES;

  const segments = useMemo(() => {
    if (segmentsProp != null && segmentsProp.length > 0) {
      return segmentsProp;
    }
    return categoriesToSegments(resolvedCategories);
  }, [resolvedCategories, segmentsProp]);

  const wheelSpinDuration = useMemo(() => {
    const speed = Math.max(0.05, rotationSpeed);
    const base = Math.max(0.01, spinDuration);
    return base / speed;
  }, [spinDuration, rotationSpeed]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const resultRef = useRef<{ index: number; label: string } | null>(null);

  const handleSpin = useCallback(() => {
    if (mustSpin || segments.length === 0) return;
    const idx = Math.floor(Math.random() * segments.length);
    const label = segments[idx]?.option ?? '';
    resultRef.current = { index: idx, label };
    setPrizeNumber(idx);
    setMustSpin(true);
  }, [mustSpin, segments]);

  const handleStop = useCallback(() => {
    setMustSpin(false);
    const r = resultRef.current;
    if (r) {
      onResult?.(r.index, r.label);
    }
  }, [onResult]);

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={segments}
          onStopSpinning={handleStop}
          spinDuration={wheelSpinDuration}
        />
        <Button type="button" onClick={handleSpin} disabled={mustSpin}>
          {mustSpin ? '…' : 'Tourner la roue'}
        </Button>
      </div>
    </div>
  );
}
