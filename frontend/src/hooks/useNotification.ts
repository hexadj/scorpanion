import { toast } from 'sonner';
import { useCallback, useMemo } from 'react';
import type { Notification } from '@/models/types';
import { NotificationSeverityEnum } from '@/models/enums';

function toastOptions(duration?: number) {
  return duration != null ? { duration } : undefined;
}

export function useNotification() {
  const show = useCallback((notification: Omit<Notification, 'id'>) => {
    const { message, severity, duration } = notification;
    const opts = toastOptions(duration);
    switch (severity) {
      case NotificationSeverityEnum.SUCCESS:
        toast.success(message, opts);
        break;
      case NotificationSeverityEnum.ERROR:
        toast.error(message, opts);
        break;
      case NotificationSeverityEnum.WARNING:
        toast.warning(message, opts);
        break;
      case NotificationSeverityEnum.INFO:
        toast.info(message, opts);
        break;
    }
  }, []);

  const showSuccess = useCallback(
    (n: Omit<Notification, 'id' | 'severity'>) => {
      toast.success(n.message, toastOptions(n.duration));
    },
    []
  );

  const showError = useCallback(
    (n: Omit<Notification, 'id' | 'severity'>) => {
      toast.error(n.message, toastOptions(n.duration));
    },
    []
  );

  const showWarning = useCallback(
    (n: Omit<Notification, 'id' | 'severity'>) => {
      toast.warning(n.message, toastOptions(n.duration));
    },
    []
  );

  const showInfo = useCallback(
    (n: Omit<Notification, 'id' | 'severity'>) => {
      toast.info(n.message, toastOptions(n.duration));
    },
    []
  );

  const remove = useCallback((id: string | number) => {
    toast.dismiss(id);
  }, []);

  const clear = useCallback(() => {
    toast.dismiss();
  }, []);

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
