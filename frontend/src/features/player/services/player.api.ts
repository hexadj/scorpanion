import { createApi } from '@reduxjs/toolkit/query/react';
import type { CreatePlayerPayload, Player } from '../types';
import { axiosBaseQuery } from '../../../services/axiosBaseQuery';

export const playerApi = createApi({
  reducerPath: 'playerApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayers: builder.query<Player[], void>({
      query: () => ({ url: '/players' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Player' as const, id })),
              { type: 'Player' as const, id: 'LIST' },
            ]
          : [{ type: 'Player' as const, id: 'LIST' }],
    }),
    createPlayer: builder.mutation<Player, CreatePlayerPayload>({
      query: (body) => ({
        url: '/players',
        method: 'post',
        data: body,
      }),
      invalidatesTags: [{ type: 'Player', id: 'LIST' }],
    }),
  }),
});

export const { useCreatePlayerMutation, useGetPlayersQuery } = playerApi;
