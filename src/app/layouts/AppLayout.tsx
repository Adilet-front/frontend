/**
 * Основной лейаут приложения: шапка, контент (Outlet), подвал.
 * Используется для всех страниц кроме /auth/*.
 */
import { Outlet } from "react-router-dom";
import { Header } from "../../widgets/layout/Header";
import { Footer } from "../../widgets/layout/Footer";
import styles from "./AppLayout.module.scss";

export const AppLayout = () => (
  <div className={styles.shell}>
    <Header />
    <main className={styles.main}>
      <Outlet />
    </main>
    <Footer />
  </div>
);
