import type { NotificationSeverity } from '@/models/enums';

export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  duration?: number;
}
