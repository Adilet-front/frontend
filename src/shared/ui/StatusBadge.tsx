/**
 * Бейдж статуса книги: доступна / забронирована / на руках.
 * Стили: .status, .status--available, .status--reserved, .status--borrowed.
 */
import { useTranslation } from "react-i18next";

type StatusBadgeProps = {
  status: "available" | "reserved" | "borrowed";
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const statusLabel: Record<StatusBadgeProps["status"], string> = {
    available: t("book.status.available"),
    reserved: t("book.status.reserved"),
    borrowed: t("book.status.taken"),
  };

  return <span className={`status status--${status}`}>{statusLabel[status]}</span>;
};
