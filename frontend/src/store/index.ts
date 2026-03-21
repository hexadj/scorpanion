/**
 * Store Redux global de l'application
 *
 * Centralise tout l'état client : auth (token, user). Utilisé via useAppSelector / useAppDispatch
 * (hooks dans hooks/store) dans les pages et composants.
 */
import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './notificationSlice';

export const store = configureStore({
    reducer: {
        notification: notificationReducer,
    },
});

/** Type de l'état global (utile pour les selecteurs typés). */
export type RootState = ReturnType<typeof store.getState>;
/** Type du dispatch (pour useAppDispatch). */
export type AppDispatch = typeof store.dispatch;
