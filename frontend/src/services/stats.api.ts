import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CatalogResponse,
  DistributionGamesParams,
  DistributionGamesResponse,
  DistributionParticipationsParams,
  DistributionParticipationsResponse,
  DistributionScoresParams,
  DistributionScoresResponse,
  DistributionWinsParams,
  DistributionWinsResponse,
  RankingsPlayersParams,
  RankingsPlayersResponse,
  TimeseriesParams,
  TimeseriesResponse,
} from '../types';
import { axiosBaseQuery } from './axiosBaseQuery';

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getCatalog: builder.query<CatalogResponse, void>({
      query: () => ({ url: '/stats/catalog' }),
    }),
    getTimeseries: builder.query<TimeseriesResponse, TimeseriesParams>({
      query: (params) => ({ url: '/stats/timeseries', params }),
    }),
    getRankingsPlayers: builder.query<RankingsPlayersResponse, RankingsPlayersParams>({
      query: (params) => ({ url: '/stats/rankings/players', params }),
    }),
    getDistributionGames: builder.query<DistributionGamesResponse, DistributionGamesParams>({
      query: (params) => ({ url: '/stats/distributions/games', params }),
    }),
    getDistributionScores: builder.query<DistributionScoresResponse, DistributionScoresParams>({
      query: (params) => ({ url: '/stats/distributions/scores', params }),
    }),
    getDistributionWins: builder.query<DistributionWinsResponse, DistributionWinsParams>({
      query: (params) => ({ url: '/stats/distributions/wins', params }),
    }),
    getDistributionParticipations: builder.query<
      DistributionParticipationsResponse,
      DistributionParticipationsParams
    >({
      query: (params) => ({ url: '/stats/distributions/participations', params }),
    }),
  }),
});

export const {
  useGetCatalogQuery,
  useGetTimeseriesQuery,
  useGetRankingsPlayersQuery,
  useGetDistributionGamesQuery,
  useGetDistributionScoresQuery,
  useGetDistributionWinsQuery,
  useGetDistributionParticipationsQuery,
} = statsApi;
