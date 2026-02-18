import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import styles from "./Footer.module.scss";
import type { AppLanguage } from "../../app/i18n/resources";

const languages: { code: AppLanguage; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kg", label: "KG" },
];

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const current = useMemo(() => i18n.resolvedLanguage, [i18n.resolvedLanguage]);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>{t("appName")}</div>
          <div className={styles.meta}>{t("footer.rights")}</div>
        </div>
        <div className={styles.lang}>
          <span className={styles.langLabel}>{t("footer.language")}</span>
          <div className={styles.langButtons}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={
                  lang.code === current ? styles.langButtonActive : styles.langButton
                }
                onClick={() => i18n.changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
