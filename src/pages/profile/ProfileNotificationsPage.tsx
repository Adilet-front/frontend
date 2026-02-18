import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getMyNotifications,
  markNotificationRead,
} from "../../entities/notification/api/notificationApi";
import type { Notification } from "../../entities/notification/model/types";
import styles from "./ProfileSettingsPage.module.scss";

type NotificationFilter = "all" | "unread";

export const ProfileNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(i18n.language, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const unreadCount = useMemo(
    () => data.filter((item) => !item.isRead).length,
    [data],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return data.filter((item) => !item.isRead);
    }
    return data;
  }, [data, filter]);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>{t("profile.notifications.title")}</h1>
        <p>{t("profile.notifications.unreadCount", { count: unreadCount })}</p>
      </div>

      <div className={styles.notificationFilters}>
        <button
          type="button"
          className={filter === "all" ? styles.actionButton : styles.actionButtonGhost}
          onClick={() => setFilter("all")}
        >
          {t("profile.notifications.filterAll")}
        </button>
        <button
          type="button"
          className={filter === "unread" ? styles.actionButton : styles.actionButtonGhost}
          onClick={() => setFilter("unread")}
        >
          {t("profile.notifications.filterUnread")}
        </button>
      </div>

      {isLoading ? <div className={styles.card}>{t("common.loading")}</div> : null}
      {isError ? (
        <div className={styles.card}>{t("profile.notifications.loadError")}</div>
      ) : null}
      {!isLoading && !isError && !filtered.length ? (
        <div className={styles.card}>{t("profile.notifications.empty")}</div>
      ) : null}

      {!isLoading && !isError && filtered.length
        ? filtered.map((notification: Notification) => (
            <article
              key={notification.id}
              className={`${styles.card} ${notification.isRead ? "" : styles.cardUnread}`}
            >
              <div className={styles.notificationMeta}>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className={styles.notificationDate}>
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              {!notification.isRead ? (
                <button
                  type="button"
                  className={styles.actionButtonGhost}
                  disabled={markAsReadMutation.isPending}
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                >
                  {t("profile.notifications.markRead")}
                </button>
              ) : null}
            </article>
          ))
        : null}
    </section>
  );
};

export default ProfileNotificationsPage;
