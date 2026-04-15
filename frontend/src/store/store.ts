import { configureStore } from '@reduxjs/toolkit';
import { gameApi, gameSessionApi, playerApi } from '../services';

export const store = configureStore({
  reducer: {
    [gameApi.reducerPath]: gameApi.reducer,
    [playerApi.reducerPath]: playerApi.reducer,
    [gameSessionApi.reducerPath]: gameSessionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      gameApi.middleware,
      playerApi.middleware,
      gameSessionApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
