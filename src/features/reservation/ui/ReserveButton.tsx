/**
 * Кнопка для бронирования книги
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { reserveBook } from "../../../entities/reservation/api/reservationApi";
import {
  optimisticIncrementUnread,
  rollbackOptimisticUnread,
  syncUnreadNotifications,
} from "../../../entities/notification/model/optimisticUnread";
import { useAuth } from "../../auth/model/useAuth";

interface ReserveButtonProps {
  bookId: number;
  bookTitle: string;
  isAvailable: boolean;
  onReserved?: () => void;
}

export const ReserveButton = ({
  bookId,
  bookTitle,
  isAvailable,
  onReserved,
}: ReserveButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: { pathname: `/book/${bookId}` } } });
      return;
    }

    if (!isAvailable) {
      alert(t("reservation.errors.notAvailable"));
      return;
    }

    let optimisticSnapshot:
      | Awaited<ReturnType<typeof optimisticIncrementUnread>>
      | undefined;

    try {
      setLoading(true);
      optimisticSnapshot = await optimisticIncrementUnread(queryClient);
      await reserveBook(bookId);
      alert(t("reservation.success", { title: bookTitle }));
      onReserved?.();
      navigate("/reservations");
    } catch (err: unknown) {
      rollbackOptimisticUnread(queryClient, optimisticSnapshot);
      const response = (
        err as { response?: { status?: number; data?: unknown } } | undefined
      )?.response;
      const status = response?.status;
      const responseData = response?.data;
      const message =
        typeof responseData === "string"
          ? responseData
          : typeof responseData === "object" && responseData
            ? (responseData as { message?: string; error?: string }).message ||
              (responseData as { message?: string; error?: string }).error
            : undefined;

      if (status === 409) {
        alert(t("reservation.errors.alreadyReserved"));
      } else if (status === 400) {
        if (
          typeof message === "string" &&
          (message.toLowerCase().includes("maximum number") ||
            message.toLowerCase().includes("максим"))
        ) {
          alert(t("reservation.errors.limitReached"));
        } else {
          alert(t("reservation.errors.notAvailable"));
        }
      } else {
        alert(t("reservation.errors.generic"));
      }
      console.error(err);
    } finally {
      await syncUnreadNotifications(queryClient);
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <button className="btn-reserve disabled" disabled>
        {t("reservation.notAvailable")}
      </button>
    );
  }

  return (
    <button
      className="btn-reserve"
      onClick={handleReserve}
      disabled={loading}
    >
      {loading ? t("reservation.reserving") : t("reservation.reserveAction")}
    </button>
  );
};
