/**
 * Лейаут для страниц входа и регистрации: по центру карточка с брендом и Outlet.
 * Без хедера и футера.
 */
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./AuthLayout.module.scss";

export const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>{t("appName")}</div>
        <Outlet />
      </div>
    </div>
  );
};
