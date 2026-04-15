import { createApi } from '@reduxjs/toolkit/query/react';
import type { GameSession } from '../types';
import { axiosBaseQuery } from './axiosBaseQuery';

export const gameSessionApi = createApi({
  reducerPath: 'gameSessionApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['GameSession'],
  endpoints: (builder) => ({
    getGameSessions: builder.query<GameSession[], void>({
      query: () => ({ url: '/game-sessions' }),
      providesTags: ['GameSession'],
    }),
  }),
});

export const { useGetGameSessionsQuery } = gameSessionApi;
