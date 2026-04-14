export enum NotificationType {
  KYC_APPROVED = "KYC_APPROVED",
  KYC_REJECTED = "KYC_REJECTED",
  KYC_FAILED = "KYC_FAILED",
  KYC_PENDING = "KYC_PENDING",
  ACCOUNT_ACTIVATED = "ACCOUNT_ACTIVATED",
  TRANSACTION_INITIATED = "TRANSACTION_INITIATED",
  TRANSACTION_COMPLETED = "TRANSACTION_COMPLETED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  PROMOTIONAL = "PROMOTIONAL",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  REFERRAL_BONUS = "REFERRAL_BONUS",
  PROFILE_UPDATED = "PROFILE_UPDATED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  created_at: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  isRead?: boolean;
}
