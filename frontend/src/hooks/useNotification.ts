import { addNotification, clearNotification, removeNotification } from '@/store/notificationSlice';
import { useAppDispatch } from './useStore';
import { useCallback, useMemo } from 'react';
import type { Notification } from '@/models/types';
import { NotificationSeverityEnum } from '@/models/enums';

export function useNotification() {
  const dispatch = useAppDispatch();

  const show = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      dispatch(addNotification(notification));
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (notification: Omit<Notification, 'id' | 'severity'>) => {
      show({ ...notification, severity: NotificationSeverityEnum.SUCCESS });
    },
    [show]
  );

  const showError = useCallback(
    (notification: Omit<Notification, 'id' | 'severity'>) => {
      show({ ...notification, severity: NotificationSeverityEnum.ERROR });
    },
    [show]
  );

  const showWarning = useCallback(
    (notification: Omit<Notification, 'id' | 'severity'>) => {
      show({ ...notification, severity: NotificationSeverityEnum.WARNING });
    },
    [show]
  );

  const showInfo = useCallback(
    (notification: Omit<Notification, 'id' | 'severity'>) => {
      show({ ...notification, severity: NotificationSeverityEnum.INFO });
    },
    [show]
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearNotification());
  }, [dispatch]);

  return useMemo(
    () => ({
      show,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      remove,
      clear,
    }),
    [show, showSuccess, showError, showWarning, showInfo, remove, clear]
  );
}
