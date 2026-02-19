import { useTranslation } from "react-i18next";
import styles from "./Footer.module.scss";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>{t("appName")}</div>
          <div className={styles.meta}>{t("footer.rights")}</div>
        </div>
      </div>
    </footer>
  );
};
