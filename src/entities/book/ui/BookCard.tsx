import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBookingStore } from "../../../features/book/model/bookingStore";
import { resolveCoverUrl } from "../../../shared/lib/media/cover";
import type { Book as BaseBook } from "../model/types";
import styles from "./BookCard.module.scss";

type BookLabel = "hit" | "exclusive" | "new" | "unavailable";

type Book = BaseBook & {
  label?: BookLabel;
};

type BookCardProps = {
  book: Book;
  isAuthed: boolean;
};

const labelKey: Record<BookLabel, string> = {
  hit: "labels.hit",
  exclusive: "labels.exclusive",
  new: "labels.new",
  unavailable: "labels.unavailable",
};

const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path
      d="M12 3.4 14.9 9.3l6.5.9-4.7 4.6 1.1 6.5L12 18.2 6.2 21.3l1.1-6.5-4.7-4.6 6.5-.9L12 3.4z"
      fill="currentColor"
    />
  </svg>
);

export const BookCard = ({ book, isAuthed }: BookCardProps) => {
  const { t } = useTranslation();
  const bookings = useBookingStore((state) => state.bookings);
  const addWish = useBookingStore((state) => state.addWish);
  const removeWish = useBookingStore((state) => state.removeWish);
  const coverSrc = resolveCoverUrl(book.coverUrl);

  const inWishlist = bookings.some(
    (item) =>
      item.bookId === book.id &&
      item.active &&
      item.readingStatus === "WILL_READ" &&
      !item.bookedAt &&
      !item.borrowedAt,
  );

  const handleWishlistClick = () => {
    if (inWishlist) {
      removeWish(book.id);
      return;
    }
    addWish({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      location: book.location,
    });
  };

  return (
    <article className={styles.card}>
      {isAuthed ? (
        <button
          type="button"
          className={`${styles.wishlist} ${inWishlist ? styles.wishlistActive : ""}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? t("wishlist.remove") : t("book.actions.wishlist")}
        >
          <HeartIcon />
        </button>
      ) : null}

      <Link
        to={`/book/${book.id}`}
        state={{ book }}
        className={styles.cardLink}
        aria-label={t("book.openAria", { title: book.title })}
      >
        <div className={styles.coverWrap}>
          {coverSrc ? (
            <img className={styles.cover} src={coverSrc} alt={book.title} loading="lazy" />
          ) : (
            <div className={styles.cover} aria-hidden="true" />
          )}
          {book.label ? (
            <span className={`${styles.label} ${styles[book.label]}`}>
              {t(labelKey[book.label])}
            </span>
          ) : null}
        </div>

        <div className={styles.meta}>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>{book.author}</p>
          {typeof book.averageRating === "number" ? (
            <div className={styles.ratingRow}>
              <span className={styles.ratingIcon}>
                <StarIcon />
              </span>
              <strong>{book.averageRating.toFixed(1)}</strong>
              {typeof book.reviewCount === "number" ? (
                <span className={styles.ratingCount}>{book.reviewCount}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
};

export type { Book, BookLabel };
