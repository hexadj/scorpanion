export const NotificationSeverityEnum = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationSeverity =
  (typeof NotificationSeverityEnum)[keyof typeof NotificationSeverityEnum];
