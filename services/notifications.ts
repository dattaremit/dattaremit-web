import { api } from "./http-client";
import type {
  Notification,
  NotificationFilters,
  PaginatedNotifications,
} from "@/types/notification";

export const getNotifications = (
  params: NotificationFilters = {},
): Promise<PaginatedNotifications> => api.get("/notifications", { params });

export const getUnreadCount = (): Promise<{ count: number }> =>
  api.get("/notifications/unread-count");

export const markNotificationAsRead = (id: string): Promise<Notification> =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = (): Promise<void> => api.patch("/notifications/read-all");

export const deleteNotification = (id: string): Promise<void> => api.delete(`/notifications/${id}`);
