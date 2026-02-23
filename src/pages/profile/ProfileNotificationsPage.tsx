import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import {
  getMyNotifications,
  markNotificationsRead,
} from "../../entities/notification/api/notificationApi";
import type {
  MarkNotificationsReadPayload,
  Notification,
} from "../../entities/notification/model/types";
import {
  createVisibilityDelayController,
  NotificationReadBuffer,
} from "./notificationReadUtils";
import styles from "./ProfileSettingsPage.module.scss";

type NotificationFilter = "all" | "unread";
const VISIBILITY_THRESHOLD = 0.5;
const VISIBILITY_DELAY_MS = 1500;
const BATCH_FLUSH_INTERVAL_MS = 3000;

interface NotificationItemProps {
  notification: Notification;
  isRead: boolean;
  formatDate: (value: string) => string;
  onSeen: (id: number) => void;
}

const NotificationItem = ({
  notification,
  isRead,
  formatDate,
  onSeen,
}: NotificationItemProps) => {
  const { ref, inView } = useInView({
    threshold: VISIBILITY_THRESHOLD,
  });
  const visibilityControllerRef = useRef<ReturnType<
    typeof createVisibilityDelayController
  > | null>(null);

  useEffect(() => {
    if (isRead) {
      visibilityControllerRef.current?.dispose();
      visibilityControllerRef.current = null;
      return;
    }

    const controller = createVisibilityDelayController(VISIBILITY_DELAY_MS, () => {
      onSeen(notification.id);
    });
    visibilityControllerRef.current = controller;

    return () => {
      controller.dispose();
      visibilityControllerRef.current = null;
    };
  }, [isRead, notification.id, onSeen]);

  useEffect(() => {
    if (isRead) {
      return;
    }

    visibilityControllerRef.current?.updateVisibility(inView);
  }, [inView, isRead]);

  return (
    <article
      ref={ref}
      className={`${styles.card} ${isRead ? "" : styles.cardUnread}`}
    >
      <div className={styles.notificationMeta}>
        <h3>{notification.title}</h3>
        <p>{notification.message}</p>
        <span className={styles.notificationDate}>
          {formatDate(notification.createdAt)}
        </span>
      </div>
    </article>
  );
};

export const ProfileNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [locallyReadIds, setLocallyReadIds] = useState<Set<number>>(new Set());
  const readBufferRef = useRef(new NotificationReadBuffer());

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

  const markAsReadBatchMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: async (_data, payload) => {
      readBufferRef.current.acknowledge(payload.ids);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        }),
      ]);
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });

  const flushReadBuffer = useCallback(() => {
    if (markAsReadBatchMutation.isPending) {
      return;
    }

    const ids = readBufferRef.current.getPayloadIds();
    if (!ids.length) {
      return;
    }

    const payload: MarkNotificationsReadPayload = { ids };
    markAsReadBatchMutation.mutate(payload);
  }, [markAsReadBatchMutation]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      flushReadBuffer();
    }, BATCH_FLUSH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [flushReadBuffer]);

  const isNotificationRead = useCallback(
    (notification: Notification) =>
      notification.isRead || locallyReadIds.has(notification.id),
    [locallyReadIds],
  );

  const handleNotificationSeen = useCallback((id: number) => {
    const isAdded = readBufferRef.current.addSeen(id);
    if (!isAdded) {
      return;
    }

    setLocallyReadIds(readBufferRef.current.getLocallyReadIds());
  }, []);

  const unreadCount = useMemo(
    () => data.filter((item) => !isNotificationRead(item)).length,
    [data, isNotificationRead],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return data.filter((item) => !isNotificationRead(item));
    }
    return data;
  }, [data, filter, isNotificationRead]);

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
            <NotificationItem
              key={notification.id}
              notification={notification}
              isRead={isNotificationRead(notification)}
              formatDate={formatDate}
              onSeen={handleNotificationSeen}
            />
          ))
        : null}
    </section>
  );
};

export default ProfileNotificationsPage;
