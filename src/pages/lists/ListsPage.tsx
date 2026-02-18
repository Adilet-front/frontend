import { useTranslation } from "react-i18next";
import styles from "./ListsPage.module.scss";

export const ListsPage = () => {
  const { t } = useTranslation();
  const lists = [
    { id: "l1", title: "Фантастика", count: 12 },
    { id: "l2", title: "Бизнес-стратегии", count: 8 },
    { id: "l3", title: "Для отдыха", count: 5 },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>{t("pages.listsTitle")}</h1>
        <p>{t("lists.subtitle")}</p>
      </div>
      <div className={styles.grid}>
        {lists.map((list) => (
          <article key={list.id} className={styles.card}>
            <div className={styles.cardTitle}>{list.title}</div>
            <div className={styles.cardMeta}>
              {t("lists.count", { count: list.count })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ListsPage;
