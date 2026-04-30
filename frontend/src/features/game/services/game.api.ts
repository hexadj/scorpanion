import { createApi } from '@reduxjs/toolkit/query/react';
import type { CreateGamePayload, Game } from '../types';
import { axiosBaseQuery } from '../../../services/axiosBaseQuery';

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Game'],
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => ({ url: '/games' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Game' as const, id })),
              { type: 'Game' as const, id: 'LIST' },
            ]
          : [{ type: 'Game' as const, id: 'LIST' }],
    }),
    createGame: builder.mutation<Game, CreateGamePayload>({
      query: (body) => ({
        url: '/games',
        method: 'post',
        data: body,
      }),
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
    }),
  }),
});

export const { useCreateGameMutation, useGetGamesQuery } = gameApi;
