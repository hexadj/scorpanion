export {
  type AxiosBaseQueryArgs,
  type AxiosBaseQueryError,
  axiosBaseQuery,
} from './axiosBaseQuery';
export { axiosClient } from './axiosClient';
export {
  gameApi,
  useCreateGameMutation,
  useGetGamesQuery,
} from '../features/game/services/game.api';
export {
  gameSessionApi,
  useCreateGameSessionMutation,
  useGetGameSessionsQuery,
  useLazyGetGameSessionsQuery,
  useGetGameSessionQuery,
} from '../features/session/services/gameSession.api';
export {
  playerApi,
  useCreatePlayerMutation,
  useGetPlayersQuery,
} from '../features/player/services/player.api';
export {
  statsApi,
  useGetCatalogQuery,
  useGetTimeseriesQuery,
  useGetRankingsPlayersQuery,
  useGetDistributionGamesQuery,
  useGetDistributionScoresQuery,
  useGetDistributionWinsQuery,
  useGetDistributionParticipationsQuery,
} from '../features/stats/services/stats.api';
