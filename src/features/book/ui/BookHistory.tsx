/**
 * Компонент истории бронирований книги
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getBookHistory } from "../../../entities/reservation/api/reservationApi";
import type { BookHistoryEntry } from "../../../entities/reservation/model/types";
import "./BookHistory.css";

interface BookHistoryProps {
  bookId: number;
}

export const BookHistory = ({ bookId }: BookHistoryProps) => {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<BookHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, bookId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getBookHistory(bookId);
      setHistory(data);
    } catch (err) {
      setError(t("bookHistory.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      ACTIVE: { class: "status-active", label: t("bookHistory.status.active") },
      COMPLETED: { class: "status-completed", label: t("bookHistory.status.completed") },
      EXPIRED: { class: "status-expired", label: t("bookHistory.status.expired") },
      CANCELLED: { class: "status-cancelled", label: t("bookHistory.status.cancelled") },
      RETURNED: { class: "status-returned", label: t("bookHistory.status.returned") },
    };
    return badges[status] || { class: "status-default", label: status };
  };

  return (
    <div className="book-history">
      <button
        className="history-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>📚 {t("bookHistory.title")}</span>
        <span className="toggle-icon">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="history-content">
          {loading ? (
            <div className="history-loading">{t("bookHistory.loading")}</div>
          ) : error ? (
            <div className="history-error">{error}</div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              {t("bookHistory.empty")}
            </div>
          ) : (
            <div className="history-list">
              {history.map((entry) => {
                const badge = getStatusBadge(entry.status);
                return (
                  <div key={entry.id} className="history-item">
                    <div className="history-user">
                      <strong>{entry.userName}</strong>
                      <span className={`history-status ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="history-dates">
                      <div className="history-date">
                        <span className="date-label">{t("bookHistory.labels.reserved")}</span>
                        <span>{formatDate(entry.reservedAt)}</span>
                      </div>
                      {entry.takenAt && (
                        <div className="history-date">
                          <span className="date-label">{t("bookHistory.labels.taken")}</span>
                          <span>{formatDate(entry.takenAt)}</span>
                        </div>
                      )}
                      {entry.returnedAt && (
                        <div className="history-date">
                          <span className="date-label">{t("bookHistory.labels.returned")}</span>
                          <span>{formatDate(entry.returnedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
