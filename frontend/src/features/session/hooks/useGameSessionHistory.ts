import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useLazyGetGameSessionsQuery } from '../services';
import type { GameSessionHistoryItem } from '../types';

const DEFAULT_PAGE_LIMIT = 20;
const DEFAULT_SENTINEL_MARGIN = '200px';
const FIRST_PAGE_ERROR_MESSAGE = "Impossible de charger l'historique.";
const NEXT_PAGE_ERROR_MESSAGE = "Impossible de charger la page suivante.";

type UseGameSessionHistoryParams = {
  gameIds: string[];
  playerIds: string[];
  pageLimit?: number;
  sentinelMargin?: string;
};

type RetryAlert = {
  message: string;
  onRetry: () => void;
};

export type UseGameSessionHistoryResult = {
  items: GameSessionHistoryItem[];
  hasMore: boolean;
  isFetching: boolean;
  retryAlert: RetryAlert | null;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

export const useGameSessionHistory = ({
  gameIds,
  playerIds,
  pageLimit = DEFAULT_PAGE_LIMIT,
  sentinelMargin = DEFAULT_SENTINEL_MARGIN,
}: UseGameSessionHistoryParams): UseGameSessionHistoryResult => {
  const [fetchHistory, { isFetching }] = useLazyGetGameSessionsQuery();

  const [items, setItems] = useState<GameSessionHistoryItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [firstPageError, setFirstPageError] = useState<string | null>(null);
  const [nextPageError, setNextPageError] = useState<string | null>(null);
  const [isSentinelVisible, setIsSentinelVisible] = useState(false);

  const latestRequestRef = useRef(0);
  const inFlightRef = useRef(false);
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (reset: boolean) => {
    if (!reset && inFlightRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    const requestId = ++latestRequestRef.current;
    inFlightRef.current = true;

    if (reset) {
      setItems([]);
      setFirstPageError(null);
      setNextPageError(null);
      cursorRef.current = null;
      hasMoreRef.current = true;
      setHasMore(true);
    }

    try {
      const page = await fetchHistory({
        gameIds,
        playerIds,
        limit: pageLimit,
        cursor: reset ? null : cursorRef.current,
      }).unwrap();

      if (requestId !== latestRequestRef.current) return;

      setItems((previousItems) =>
        reset ? page.gameSessionsHistoryItems : [...previousItems, ...page.gameSessionsHistoryItems],
      );
      cursorRef.current = page.nextCursor;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      setFirstPageError(null);
      setNextPageError(null);
    } catch {
      if (requestId !== latestRequestRef.current) return;
      if (reset) {
        setFirstPageError(FIRST_PAGE_ERROR_MESSAGE);
        return;
      }
      setNextPageError(NEXT_PAGE_ERROR_MESSAGE);
    } finally {
      if (requestId === latestRequestRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [fetchHistory, gameIds, pageLimit, playerIds]);

  const loadFirstPage = useCallback(async () => {
    await loadPage(true);
  }, [loadPage]);

  const loadNextPage = useCallback(async () => {
    await loadPage(false);
  }, [loadPage]);

  const retryAlert = useMemo<RetryAlert | null>(() => {
    if (firstPageError) {
      return {
        message: firstPageError,
        onRetry: () => {
          void loadFirstPage();
        },
      };
    }

    if (items.length > 0 && !isFetching && nextPageError) {
      return {
        message: nextPageError,
        onRetry: () => {
          setNextPageError(null);
          void loadNextPage();
        },
      };
    }

    return null;
  }, [firstPageError, isFetching, items.length, loadFirstPage, loadNextPage, nextPageError]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    const sentinelElement = sentinelRef.current;
    if (!sentinelElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsSentinelVisible(entries[0]?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: sentinelMargin,
        threshold: 0,
      },
    );

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [sentinelMargin]);

  useEffect(() => {
    if (!isSentinelVisible) return;
    if (isFetching) return;
    if (!hasMore) return;
    if (firstPageError) return;
    if (nextPageError) return;
    void loadNextPage();
  }, [firstPageError, hasMore, isFetching, isSentinelVisible, loadNextPage, nextPageError]);

  return {
    items,
    hasMore,
    isFetching,
    retryAlert,
    sentinelRef,
  };
};
