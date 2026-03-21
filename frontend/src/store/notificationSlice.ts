import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { RootState } from './index';
import type { Notification } from '@/models/types';

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = uuidv4();
      const duration = action.payload.duration || 5000;
      state.notifications.push({ id, duration, ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotification: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotification } = notificationSlice.actions;
export const selectNotifications = (state: RootState) =>
  state.notification.notifications;
export default notificationSlice.reducer;
