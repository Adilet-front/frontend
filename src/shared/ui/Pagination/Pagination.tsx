import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Pagination.module.scss";

type PageItem = number | "dots-left" | "dots-right";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
  ariaLabel?: string;
};

const buildPageItems = (
  currentPage: number,
  totalPages: number,
  compact: boolean,
): PageItem[] => {
  if (totalPages <= 1) {
    return [1];
  }

  const numbers = new Set<number>([1, totalPages, currentPage]);
  numbers.add(Math.max(1, currentPage - 1));
  numbers.add(Math.min(totalPages, currentPage + 1));
  if (!compact) {
    numbers.add(Math.max(1, currentPage - 2));
    numbers.add(Math.min(totalPages, currentPage + 2));
  }

  if (currentPage <= 3) {
    numbers.add(2);
    numbers.add(3);
  }
  if (currentPage >= totalPages - 2) {
    numbers.add(totalPages - 1);
    numbers.add(totalPages - 2);
  }

  const sortedNumbers = [...numbers]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);

  const items: PageItem[] = [];
  for (let index = 0; index < sortedNumbers.length; index += 1) {
    const pageNumber = sortedNumbers[index];
    const previous = sortedNumbers[index - 1];
    if (index > 0 && previous !== undefined && pageNumber - previous > 1) {
      items.push(items.includes("dots-left") ? "dots-right" : "dots-left");
    }
    items.push(pageNumber);
  }

  return items;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  compact = false,
  ariaLabel,
}: PaginationProps) => {
  const { t } = useTranslation();
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  const items = useMemo(
    () => buildPageItems(currentPage, totalPages, compact),
    [compact, currentPage, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label={ariaLabel ?? t("pagination.aria")}> 
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label={t("pagination.prevAria")}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div className={styles.pages}>
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              className={item === currentPage ? styles.pageActive : styles.page}
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className={styles.dots} aria-hidden="true">
              …
            </span>
          ),
        )}
      </div>

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label={t("pagination.nextAria")}
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
};
