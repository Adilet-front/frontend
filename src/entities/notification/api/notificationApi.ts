import { apiClient } from "../../../shared/api/apiClient";
import type { MarkNotificationsReadPayload, Notification } from "../model/types";

export const getMyNotifications = async (): Promise<Notification[]> => {
  const { data } = await apiClient.get<Notification[]>("/api/notifications");
  return data;
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const { data } = await apiClient.get<number>("/api/notifications/unread-count");
  return data;
};

export const markNotificationsRead = async (
  payload: MarkNotificationsReadPayload,
): Promise<void> => {
  await apiClient.patch("/api/notifications/read", payload);
};
