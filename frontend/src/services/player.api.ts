import { createApi } from '@reduxjs/toolkit/query/react';
import type { Player } from '../types';
import { axiosBaseQuery } from './axiosBaseQuery';

export const playerApi = createApi({
  reducerPath: 'playerApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayers: builder.query<Player[], void>({
      query: () => ({ url: '/players' }),
      providesTags: ['Player'],
    }),
  }),
});

export const { useGetPlayersQuery } = playerApi;
