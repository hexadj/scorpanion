/**
 * Affiche une notification "toast" en bas de l'écran.
 */
import { useAppDispatch, useAppSelector } from '@/hooks';
import { removeNotification, selectNotifications } from '@/store/notificationSlice';
import { NotificationSeverityEnum } from '@/models/enums';
import { useEffect } from 'react';

const severityClasses = {
  [NotificationSeverityEnum.ERROR]: 'bg-red-600 text-white',
  [NotificationSeverityEnum.WARNING]: 'bg-amber-500 text-black',
  [NotificationSeverityEnum.SUCCESS]: 'bg-emerald-600 text-white',
  [NotificationSeverityEnum.INFO]: 'bg-slate-800 text-white',
} as const;

export function NotificationContainer() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const current = notifications[0] ?? null;

  const handleClose = () => {
    if (current) dispatch(removeNotification(current.id));
  };

  useEffect(() => {
    if (!current) return;

    const timeoutId = window.setTimeout(() => {
      dispatch(removeNotification(current.id));
    }, current.duration ?? 5000);

    return () => window.clearTimeout(timeoutId);
  }, [current, dispatch]);

  if (!current) return null;

  const severityClass = severityClasses[current.severity];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto w-full max-w-md rounded-lg px-4 py-3 shadow-lg ${severityClass}`}
      >
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm font-medium">{current.message}</p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded px-1 text-lg leading-none opacity-80 transition hover:opacity-100"
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
