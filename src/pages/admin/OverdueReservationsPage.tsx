/**
 * Страница просроченных бронирований (Admin)
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getOverdueReservations } from "../../entities/reservation/api/reservationApi";
import type { ReservationResponse } from "../../entities/reservation/model/types";
import "../../app/styles/admin.css";

export const OverdueReservationsPage = () => {
  const { t, i18n } = useTranslation();
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverdueReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getOverdueReservations();
      setReservations(data);
    } catch (err) {
      setError(t("admin.overdue.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdueReservations();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: t("reservations.status.active"),
      COMPLETED: t("reservations.status.completed"),
      EXPIRED: t("reservations.status.expired"),
      CANCELLED: t("reservations.status.cancelled"),
      RETURNED: t("reservations.status.returned"),
    };
    return labels[status] || status;
  };

  const getDaysOverdue = (takenAt?: string) => {
    if (!takenAt) return 0;
    const taken = new Date(takenAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - taken.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Предполагаем что срок выдачи - 14 дней
    return Math.max(0, diffDays - 14);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{t("admin.overdue.title")}</h1>
        <p>{t("admin.overdue.subtitle")}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">{t("common.loading")}</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>{t("admin.overdue.empty")}</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.overdue.table.bookId")}</th>
                <th>{t("admin.overdue.table.bookTitle")}</th>
                <th>{t("admin.overdue.table.reservationId")}</th>
                <th>{t("admin.overdue.table.reservedAt")}</th>
                <th>{t("admin.overdue.table.takenAt")}</th>
                <th>{t("admin.overdue.table.daysOverdue")}</th>
                <th>{t("admin.overdue.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => {
                const daysOverdue = getDaysOverdue(reservation.takenAt);
                return (
                  <tr key={reservation.id}>
                    <td>{reservation.bookId}</td>
                    <td>
                      <Link to={`/book/${reservation.bookId}`}>
                        {reservation.bookTitle}
                      </Link>
                    </td>
                    <td>#{reservation.id}</td>
                    <td>{formatDate(reservation.reservedAt)}</td>
                    <td>{formatDate(reservation.takenAt)}</td>
                    <td>
                      <span className="badge badge-danger">
                        {t("admin.overdue.daysUnit", { count: daysOverdue })}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OverdueReservationsPage;
