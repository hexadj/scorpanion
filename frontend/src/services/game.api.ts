import { createApi } from '@reduxjs/toolkit/query/react';
import type { Game } from '../types';
import { axiosBaseQuery } from './axiosBaseQuery';

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Game'],
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => ({ url: '/games' }),
      providesTags: ['Game'],
    }),
  }),
});

export const { useGetGamesQuery } = gameApi;
