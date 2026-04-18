import { createApi } from '@reduxjs/toolkit/query/react';
import type { CreateGameSessionPayload, GameSession, GetGameSessionHistoryPayload, GameSessionHistoryPage } from '../types';
import { axiosBaseQuery } from './axiosBaseQuery';

export const gameSessionApi = createApi({
  reducerPath: 'gameSessionApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['GameSession'],
  endpoints: (builder) => ({
    getGameSessions: builder.query<GameSessionHistoryPage, GetGameSessionHistoryPayload>({
      query: ({ gameIds = [], playerIds = [], limit = 20, cursor = null }) => ({
        url: '/game-sessions',
        params: {
          gameIds: gameIds.length ? gameIds.join(',') : undefined,
          playerIds: playerIds.length ? playerIds.join(',') : undefined,
          limit,
          cursor: cursor ?? undefined,
        }
      }),
      providesTags: ['GameSession'],
    }),
    createGameSession: builder.mutation<GameSession, CreateGameSessionPayload>({
      query: (body) => ({
        url: '/game-sessions',
        method: 'post',
        data: body,
      }),
      invalidatesTags: ['GameSession'],
    }),
  }),
});

export const { useCreateGameSessionMutation, useGetGameSessionsQuery, useLazyGetGameSessionsQuery } = gameSessionApi;
