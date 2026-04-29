import { configureStore } from '@reduxjs/toolkit';
import { gameApi, gameSessionApi, playerApi, statsApi } from '../services';

export const store = configureStore({
  reducer: {
    [gameApi.reducerPath]: gameApi.reducer,
    [playerApi.reducerPath]: playerApi.reducer,
    [gameSessionApi.reducerPath]: gameSessionApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      gameApi.middleware,
      playerApi.middleware,
      gameSessionApi.middleware,
      statsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
