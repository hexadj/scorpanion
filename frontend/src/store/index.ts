/**
 * Store Redux global — prêt pour de futurs slices (ex. auth).
 * Le slice `app` est un placeholder sans actions ; remplace-le ou fusionne avec d’autres reducers.
 */
import { configureStore, createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {} as Record<string, never>,
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
