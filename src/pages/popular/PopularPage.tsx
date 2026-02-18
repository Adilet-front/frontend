import { useTranslation } from "react-i18next";
import styles from "../Page.module.scss";

export const PopularPage = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t("pages.popularTitle")}</h1>
        <p className={styles.heroSubtitle}>{t("hints.searchHelper")}</p>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardTitle}>#{index + 1}</div>
            <div className={styles.cardText}>{t("pages.bookTitle")}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularPage;
