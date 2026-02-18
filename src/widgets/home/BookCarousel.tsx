import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookCard, type Book } from "../../entities/book/ui/BookCard";
import styles from "./BookCarousel.module.scss";

type BookCarouselProps = {
  title: string;
  books: Book[];
  isAuthed: boolean;
  emptyText?: string;
};

export const BookCarousel = ({
  title,
  books,
  isAuthed,
  emptyText,
}: BookCarouselProps) => {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const hasBooks = books.length > 0;

  const syncScrollControls = () => {
    const node = trackRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const tolerance = 2;
    setCanScrollLeft(node.scrollLeft > tolerance);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - tolerance);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(syncScrollControls);

    const node = trackRef.current;
    if (!node) {
      window.cancelAnimationFrame(frame);
      return;
    }

    node.addEventListener("scroll", syncScrollControls, { passive: true });
    window.addEventListener("resize", syncScrollControls);

    return () => {
      window.cancelAnimationFrame(frame);
      node.removeEventListener("scroll", syncScrollControls);
      window.removeEventListener("resize", syncScrollControls);
    };
  }, [hasBooks]);

  const scrollTrack = (direction: "left" | "right") => {
    const node = trackRef.current;
    if (!node) {
      return;
    }

    const scrollAmount = Math.max(280, Math.round(node.clientWidth * 0.82));

    node.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollTrack("left")}
            aria-label={t("pagination.prevAria")}
            disabled={!canScrollLeft}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scrollTrack("right")}
            aria-label={t("pagination.nextAria")}
            disabled={!canScrollRight}
          >
            ›
          </button>
        </div>
      </div>

      {hasBooks ? (
        <div className={styles.track} ref={trackRef}>
          {books.map((book) => (
            <div key={book.id} className={styles.item}>
              <BookCard book={book} isAuthed={isAuthed} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>{emptyText ?? t("catalog.empty")}</div>
      )}
    </section>
  );
};
