import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

type SpinningArrowProps = {
  className?: string;
};

/** Flèche vers le haut (tige + pointe), centrée pour une rotation stable. */
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M 32 4 L 52 30 L 40 30 L 40 58 L 24 58 L 24 30 L 12 30 Z"
      />
    </svg>
  );
}

export function SpinningArrow({ className }: SpinningArrowProps) {
  const [rotationDeg, setRotationDeg] = useState(0);
  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    spinningRef.current = true;

    const startRotation = rotationRef.current;
    const minSpins = 4 + Math.random() * 2;
    const extra = Math.random() * 360;
    const targetRotation = startRotation + minSpins * 360 + extra;
    const durationMs = 2800 + Math.random() * 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      const next = startRotation + (targetRotation - startRotation) * eased;
      setRotationDeg(next);
      rotationRef.current = next;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        spinningRef.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  return (
    <div className={className}>
      <p className="mb-4 text-center text-sm text-muted-foreground">Cliquez pour lancer la flèche</p>
      <Card
        role="button"
        tabIndex={0}
        onClick={spin}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            spin();
          }
        }}
        aria-label="Faire tourner la flèche"
        className="cursor-pointer shadow-sm select-none"
      >
        <CardContent className="flex min-h-[200px] items-center justify-center p-8">
          <div
            className="flex h-36 w-36 items-center justify-center [&_svg]:h-full [&_svg]:w-full"
            style={{ transform: `rotate(${rotationDeg}deg)` }}
          >
            <ArrowIcon className="text-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
