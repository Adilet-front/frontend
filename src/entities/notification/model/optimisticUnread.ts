import type { QueryClient } from "@tanstack/react-query";

type OptimisticUnreadSnapshot = {
  previousUnreadCount: number | undefined;
};

const unreadNotificationsKey = ["notifications", "unread-count"] as const;
const notificationsKey = ["notifications"] as const;

export const optimisticIncrementUnread = async (
  queryClient: QueryClient,
): Promise<OptimisticUnreadSnapshot> => {
  await queryClient.cancelQueries({ queryKey: unreadNotificationsKey });

  const previousUnreadCount = queryClient.getQueryData<number>(
    unreadNotificationsKey,
  );

  queryClient.setQueryData<number>(unreadNotificationsKey, (currentCount) =>
    Math.max(0, (currentCount ?? 0) + 1),
  );

  return { previousUnreadCount };
};

export const rollbackOptimisticUnread = (
  queryClient: QueryClient,
  snapshot?: OptimisticUnreadSnapshot,
) => {
  queryClient.setQueryData(unreadNotificationsKey, snapshot?.previousUnreadCount);
};

export const syncUnreadNotifications = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: unreadNotificationsKey }),
    queryClient.invalidateQueries({ queryKey: notificationsKey }),
  ]);
};
