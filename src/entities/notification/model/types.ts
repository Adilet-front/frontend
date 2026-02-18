export type NotificationType =
  | "RESERVATION_SUCCESS"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_REMINDER"
  | "RESERVATION_EXPIRED"
  | string;

export type Notification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
};
