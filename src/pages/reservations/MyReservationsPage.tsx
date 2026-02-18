/**
 * Страница "Мои бронирования"
 */
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getMyReservations,
  takeReservedBook,
  returnBook,
  cancelReservation,
} from "../../entities/reservation/api/reservationApi";
import {
  optimisticIncrementUnread,
  rollbackOptimisticUnread,
  syncUnreadNotifications,
} from "../../entities/notification/model/optimisticUnread";
import type { ReservationResponse } from "../../entities/reservation/model/types";
import "../../app/styles/reservations.css";

type FilterTab = "all" | "active" | "completed";

export const MyReservationsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [error, setError] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getMyReservations();
      setReservations(data);
    } catch (err) {
      setError(t("reservations.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleTakeBook = async (id: number) => {
    let optimisticSnapshot:
      | Awaited<ReturnType<typeof optimisticIncrementUnread>>
      | undefined;

    try {
      optimisticSnapshot = await optimisticIncrementUnread(queryClient);
      await takeReservedBook(id);
      loadReservations();
    } catch (err) {
      rollbackOptimisticUnread(queryClient, optimisticSnapshot);
      alert(t("reservations.errors.take"));
      console.error(err);
    } finally {
      await syncUnreadNotifications(queryClient);
    }
  };

  const handleReturnBook = async (id: number) => {
    let optimisticSnapshot:
      | Awaited<ReturnType<typeof optimisticIncrementUnread>>
      | undefined;

    try {
      optimisticSnapshot = await optimisticIncrementUnread(queryClient);
      await returnBook(id);
      loadReservations();
    } catch (err) {
      rollbackOptimisticUnread(queryClient, optimisticSnapshot);
      alert(t("reservations.errors.return"));
      console.error(err);
    } finally {
      await syncUnreadNotifications(queryClient);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm(t("reservations.confirmCancel"))) {
      return;
    }

    let optimisticSnapshot:
      | Awaited<ReturnType<typeof optimisticIncrementUnread>>
      | undefined;

    try {
      optimisticSnapshot = await optimisticIncrementUnread(queryClient);
      await cancelReservation(id);
      loadReservations();
    } catch (err) {
      rollbackOptimisticUnread(queryClient, optimisticSnapshot);
      alert(t("reservations.errors.cancel"));
      console.error(err);
    } finally {
      await syncUnreadNotifications(queryClient);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === "active") {
      return reservation.status === "ACTIVE";
    }

    if (filter === "completed") {
      return reservation.status === "COMPLETED" || reservation.status === "RETURNED";
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      ACTIVE: { class: "badge-success", label: t("reservations.status.active") },
      COMPLETED: { class: "badge-info", label: t("reservations.status.completed") },
      EXPIRED: { class: "badge-danger", label: t("reservations.status.expired") },
      CANCELLED: { class: "badge-default", label: t("reservations.status.cancelled") },
      RETURNED: { class: "badge-success", label: t("reservations.status.returned") },
    };
    return badges[status] || { class: "badge-default", label: status };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      return t("common.notAvailable");
    }

    return new Date(dateStr).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>{t("reservations.title")}</h1>
        <p>{t("reservations.subtitle")}</p>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {t("reservations.filters.all")}
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          {t("reservations.filters.active")}
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          {t("reservations.filters.completed")}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">{t("common.loading")}</div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>{t("reservations.empty")}</p>
          <Link to="/catalog" className="btn-primary">
            {t("reservations.browse")}
          </Link>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => {
            const badge = getStatusBadge(reservation.status);
            return (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-info">
                  <h3>
                    <Link to={`/book/${reservation.bookId}`}>
                      {reservation.bookTitle}
                    </Link>
                  </h3>
                  <div className="reservation-dates">
                    <div className="date-item">
                      <span className="date-label">{t("reservations.dateReserved")}</span>
                      <span className="date-value">
                        {formatDate(reservation.reservedAt)}
                      </span>
                    </div>
                    {reservation.takenAt && (
                      <div className="date-item">
                        <span className="date-label">{t("reservations.dateTaken")}</span>
                        <span className="date-value">
                          {formatDate(reservation.takenAt)}
                        </span>
                      </div>
                    )}
                    {reservation.returnedAt && (
                      <div className="date-item">
                        <span className="date-label">{t("reservations.dateReturned")}</span>
                        <span className="date-value">
                          {formatDate(reservation.returnedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`badge ${badge.class}`}>{badge.label}</span>
                </div>

                <div className="reservation-actions">
                  {reservation.status === "ACTIVE" && !reservation.takenAt && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => handleTakeBook(reservation.id)}
                      >
                        {t("reservations.actions.take")}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        {t("reservations.actions.cancel")}
                      </button>
                    </>
                  )}
                  {reservation.status === "ACTIVE" && reservation.takenAt && !reservation.returnedAt && (
                    <button
                      className="btn-success"
                      onClick={() => handleReturnBook(reservation.id)}
                    >
                      {t("reservations.actions.return")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
