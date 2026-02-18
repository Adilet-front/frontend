import { useTranslation } from "react-i18next";
import styles from "./BookDetails.module.scss";

export type BookMetaInfo = {
  format?: string;
  language?: string;
  tags?: string[];
  description?: string;
};

type BookMetaProps = {
  meta: BookMetaInfo;
};

export const BookMeta = ({ meta }: BookMetaProps) => {
  const { t } = useTranslation();
  const hasTags = Boolean(meta.tags && meta.tags.length > 0);
  const hasMeta = meta.format || meta.language || hasTags;

  return (
    <div className={styles.section}>
      {meta.description ? (
        <div>
          <h2>{t("book.description")}</h2>
          <p>{meta.description}</p>
        </div>
      ) : null}
      {hasMeta ? (
        <div className={styles.metaGrid}>
          {meta.format ? (
            <div>
              <h3>{t("book.format")}</h3>
              <p>{meta.format}</p>
            </div>
          ) : null}
          {meta.language ? (
            <div>
              <h3>{t("book.language")}</h3>
              <p>{meta.language}</p>
            </div>
          ) : null}
          {hasTags ? (
            <div>
              <h3>{t("book.tags")}</h3>
              <div className={styles.tagList}>
                {meta.tags?.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
