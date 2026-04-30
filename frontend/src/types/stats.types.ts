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
  HOUR: 'hour',
  DAY: 'day',
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
  hour: 'Heure',
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
};

export const periodToInterval = (period: StatsPeriod): StatsInterval => {
  switch (period) {
    case 'today': return STATS_INTERVALS.HOUR;
    case 'this_week':
    case 'this_month':
    case 'last_30_days': return STATS_INTERVALS.DAY;
    case 'this_year': return STATS_INTERVALS.WEEK;
    case 'all': return STATS_INTERVALS.MONTH;
  }
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
  scope: Extract<StatsScope, 'global' | 'player'>;
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
  scope: Extract<StatsScope, 'global' | 'game'>;
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
  scope: Extract<StatsScope, 'global' | 'game'>;
  gameId?: string;
  from?: string;
  to?: string;
};

// Global filters shared across stats sections
export type StatsGlobalFilters = {
  from: string | undefined;
  to: string | undefined;
};

export const STATS_PERIODS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_30_DAYS: 'last_30_days',
  THIS_YEAR: 'this_year',
  ALL: 'all',
} as const;

export type StatsPeriod = (typeof STATS_PERIODS)[keyof typeof STATS_PERIODS];

export const STATS_PERIOD_LABELS: Record<StatsPeriod, string> = {
  today: "Aujourd'hui",
  this_week: 'Cette semaine',
  this_month: 'Ce mois',
  last_30_days: '30 derniers jours',
  this_year: 'Cette année',
  all: 'Toujours',
};

const pad = (n: number) => String(n).padStart(2, '0');
const toIsoMidnight = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T00:00:00Z`;

export const periodToDates = (period: StatsPeriod): { from: string | undefined; to: string | undefined } => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  switch (period) {
    case 'today': {
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      return { from: toIsoMidnight(today), to: toIsoMidnight(tomorrow) };
    }
    case 'this_week': {
      const day = today.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setUTCDate(monday.getUTCDate() + diff);
      return { from: toIsoMidnight(monday), to: undefined };
    }
    case 'this_month': {
      const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      return { from: toIsoMidnight(firstOfMonth), to: undefined };
    }
    case 'last_30_days': {
      const ago = new Date(today);
      ago.setUTCDate(ago.getUTCDate() - 30);
      return { from: toIsoMidnight(ago), to: undefined };
    }
    case 'this_year': {
      const firstOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      return { from: toIsoMidnight(firstOfYear), to: undefined };
    }
    case 'all':
      return { from: undefined, to: undefined };
  }
};
