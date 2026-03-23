import { getHistoryByUserId } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotification } from '@/hooks';
import { useAppSelector } from '@/hooks/useStore';
import type { PlayerResult } from '@/models/types';
import { Crown, House } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

function formatPlayedAt(playedAt: string): string {
  const date = new Date(playedAt);
  if (Number.isNaN(date.getTime())) {
    return playedAt;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function HistoryPage() {
  const authUser = useAppSelector((s) => s.auth.user);
  const notification = useNotification();

  const [history, setHistory] = useState<PlayerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser === null) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const playerResults = await getHistoryByUserId(authUser.id);
        if (!cancelled) {
          setHistory(playerResults);
        }
      } catch {
        if (!cancelled) {
          notification.showError({ message: "Impossible de charger l'historique." });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser, notification]);

  const orderedHistory = useMemo(
    () =>
      [...history].sort((a, b) => {
        const dateDiff = new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime();
        if (!Number.isNaN(dateDiff) && dateDiff !== 0) {
          return dateDiff;
        }
        if (a.rank !== b.rank) {
          return a.rank - b.rank;
        }
        return b.finalScore - a.finalScore;
      }),
    [history]
  );

  if (authUser === null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Historique</h1>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/">
            <House className="size-4" />
            Accueil
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Mes résultats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : orderedHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun résultat pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[1%] whitespace-nowrap">Rang</TableHead>
                  <TableHead>Jeu</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedHistory.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <span>{result.rank}</span>
                        {result.hasWon ? (
                          <Crown className="size-4 text-amber-500" aria-label="Vainqueur" />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell>{result.gameName}</TableCell>
                    <TableCell>{result.finalScore}</TableCell>
                    <TableCell>{formatPlayedAt(result.playedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
