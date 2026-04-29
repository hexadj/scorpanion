export const STATS_METRICS = {
  SESSION_COUNT: 'sessionCount',
  PARTICIPATION_COUNT: 'participationCount',
  WIN_COUNT: 'winCount',
  WIN_RATE: 'winRate',
  AVERAGE_SCORE: 'averageScore',
  MIN_SCORE: 'minScore',
  MAX_SCORE: 'maxScore',
  AVERAGE_RANK: 'averageRank',
  PLAYED_GAME_COUNT: 'playedGameCount',
  ACTIVE_PLAYER_COUNT: 'activePlayerCount',
} as const;

export type StatsMetric = (typeof STATS_METRICS)[keyof typeof STATS_METRICS];

export const STATS_SCOPES = {
  GLOBAL: 'global',
  PLAYER: 'player',
  GAME: 'game',
} as const;

export type StatsScope = (typeof STATS_SCOPES)[keyof typeof STATS_SCOPES];

export const STATS_INTERVALS = {
  WEEK: 'week',
  MONTH: 'month',
} as const;

export type StatsInterval = (typeof STATS_INTERVALS)[keyof typeof STATS_INTERVALS];

export const TIMESERIES_METRICS_BY_SCOPE: Record<StatsScope, StatsMetric[]> = {
  global: ['sessionCount', 'playedGameCount', 'activePlayerCount'],
  player: [
    'sessionCount',
    'participationCount',
    'winCount',
    'winRate',
    'averageScore',
    'minScore',
    'maxScore',
    'averageRank',
    'playedGameCount',
  ],
  game: ['sessionCount', 'averageScore', 'minScore', 'maxScore', 'activePlayerCount'],
};

export const RANKING_METRICS: StatsMetric[] = [
  'winRate',
  'winCount',
  'participationCount',
  'averageScore',
  'averageRank',
];

export const STATS_METRIC_LABELS: Record<StatsMetric, string> = {
  sessionCount: 'Parties jouées',
  participationCount: 'Participations',
  winCount: 'Victoires',
  winRate: 'Winrate',
  averageScore: 'Score moyen',
  minScore: 'Score min',
  maxScore: 'Score max',
  averageRank: 'Rang moyen',
  playedGameCount: 'Jeux joués',
  activePlayerCount: 'Joueurs actifs',
};

export const STATS_SCOPE_LABELS: Record<StatsScope, string> = {
  global: 'Global',
  player: 'Joueur',
  game: 'Jeu',
};

export const STATS_INTERVAL_LABELS: Record<StatsInterval, string> = {
  week: 'Semaine',
  month: 'Mois',
};

// Catalog
export type CatalogMetricInfo = {
  id: string;
  label: string;
  description: string;
  supportedDatasets: string[];
  constraints: string[];
};

export type CatalogResponse = {
  supportedIntervals: string[];
  supportedScopes: string[];
  metrics: CatalogMetricInfo[];
};

// Timeseries
export type TimeseriesPoint = {
  bucketStart: string;
  value: number | null;
  sampleSize: number;
};

export type TimeseriesResponse = {
  metric: string;
  scope: string;
  interval: string;
  filters: {
    from: string;
    to: string;
    playerId: string | null;
    gameId: string | null;
  };
  series: TimeseriesPoint[];
  generatedAt: string;
};

export type TimeseriesParams = {
  metric: StatsMetric;
  scope: StatsScope;
  interval: StatsInterval;
  from?: string;
  to?: string;
  playerId?: string;
  gameId?: string;
};

// Rankings
export type RankingRow = {
  rank: number | null;
  player: { id: string; name: string };
  value: number | null;
  hasValue: boolean;
  winCount: number;
  participationCount: number;
};

export type RankingsPlayersResponse = {
  metric: string;
  filters: {
    from: string | null;
    to: string | null;
    gameId: string | null;
  };
  paging: { limit: number; offset: number; total: number };
  rows: RankingRow[];
};

export type RankingsPlayersParams = {
  metric: StatsMetric;
  from?: string;
  to?: string;
  gameId?: string;
  limit?: number;
  offset?: number;
};

// Distribution Games
export type GameDistributionRow = {
  game: { id: string; name: string; resultType: string } | null;
  isOthers: boolean;
  sessionCount: number;
  share: number;
};

export type DistributionGamesResponse = {
  scope: string;
  filters: { playerId: string | null; from: string | null; to: string | null };
  totalSessionCount: number;
  rows: GameDistributionRow[];
};

export type DistributionGamesParams = {
  scope: 'global' | 'player';
  playerId?: string;
  from?: string;
  to?: string;
  limit?: number;
  includeOthers?: boolean;
};

// Distribution Scores
export type ScoreBucketInfo = { lowerInclusive: number; upperExclusive: number; label: string };

export type ScoreDistributionRow = {
  bucket: ScoreBucketInfo | null;
  isOthers: boolean;
  count: number;
  share: number;
};

export type DistributionScoresResponse = {
  scope: string;
  filters: { playerId: string | null; gameId: string | null; from: string | null; to: string | null };
  totalSampleSize: number;
  rows: ScoreDistributionRow[];
};

export type DistributionScoresParams = {
  scope: StatsScope;
  playerId?: string;
  gameId: string;
  from?: string;
  to?: string;
  limit?: number;
  includeOthers?: boolean;
};

// Distribution Wins
export type WinsBucketInfo = { id: string; label: string };

export type WinsDistributionRow = { bucket: WinsBucketInfo; count: number; share: number };

export type DistributionWinsResponse = {
  scope: string;
  filters: { gameId: string | null; from: string | null; to: string | null };
  totalPlayerCount: number;
  rows: WinsDistributionRow[];
};

export type DistributionWinsParams = {
  scope: 'global' | 'game';
  gameId?: string;
  from?: string;
  to?: string;
};

// Distribution Participations
export type ParticipationsBucketInfo = { id: string; label: string };

export type ParticipationsDistributionRow = { bucket: ParticipationsBucketInfo; count: number; share: number };

export type DistributionParticipationsResponse = {
  scope: string;
  filters: { gameId: string | null; from: string | null; to: string | null };
  totalPlayerCount: number;
  rows: ParticipationsDistributionRow[];
};

export type DistributionParticipationsParams = {
  scope: 'global' | 'game';
  gameId?: string;
  from?: string;
  to?: string;
};

// Global filters shared across stats sections
export type StatsGlobalFilters = {
  from: string | undefined;
  to: string | undefined;
  gameId: string | undefined;
  playerId: string | undefined;
};
