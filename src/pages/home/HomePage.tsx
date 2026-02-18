import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getBooks } from "../../entities/book/api/bookApi";
import type { Book as ApiBook } from "../../entities/book/model/types";
import { type Book } from "../../entities/book/ui/BookCard";
import { useAuth } from "../../features/auth/model/useAuth";
import { BookCarousel } from "../../widgets/home/BookCarousel";
import styles from "./HomePage.module.scss";

const RAIL_BOOKS_LIMIT = 16;
const SKELETON_ITEMS = 6;

const sortByRecommended = (left: ApiBook, right: ApiBook) => {
  const leftRating = left.averageRating ?? 0;
  const rightRating = right.averageRating ?? 0;
  if (rightRating !== leftRating) {
    return rightRating - leftRating;
  }

  const leftReviews = left.reviewCount ?? 0;
  const rightReviews = right.reviewCount ?? 0;
  if (rightReviews !== leftReviews) {
    return rightReviews - leftReviews;
  }

  return right.id - left.id;
};

const sortByPopular = (left: ApiBook, right: ApiBook) => {
  const leftReviews = left.reviewCount ?? 0;
  const rightReviews = right.reviewCount ?? 0;
  if (rightReviews !== leftReviews) {
    return rightReviews - leftReviews;
  }

  const leftRating = left.averageRating ?? 0;
  const rightRating = right.averageRating ?? 0;
  if (rightRating !== leftRating) {
    return rightRating - leftRating;
  }

  return right.id - left.id;
};

const sortByRecent = (left: ApiBook, right: ApiBook) => right.id - left.id;

const toCardBook = (book: ApiBook): Book => ({
  id: book.id,
  title: book.title,
  author: book.author,
  coverUrl: book.coverUrl,
  category: book.category,
  averageRating: book.averageRating,
  reviewCount: book.reviewCount,
  status: book.status,
  label: book.status === "AVAILABLE" ? undefined : "unavailable",
});

const pickBooks = (
  source: ApiBook[],
  limit: number,
  sortFn: (left: ApiBook, right: ApiBook) => number,
) => [...source].sort(sortFn).slice(0, limit).map(toCardBook);

const HomeSkeleton = () => (
  <div className={styles.skeletonGrid} aria-hidden="true">
    {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
      <div key={index} className={styles.skeletonCard} />
    ))}
  </div>
);

export const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const {
    data: books = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["home", "books"],
    queryFn: getBooks,
    staleTime: 60_000,
  });

  const { recommendedBooks, popularBooks, recentBooks } = useMemo(
    () => ({
      recommendedBooks: pickBooks(books, RAIL_BOOKS_LIMIT, sortByRecommended),
      popularBooks: pickBooks(books, RAIL_BOOKS_LIMIT, sortByPopular),
      recentBooks: pickBooks(books, RAIL_BOOKS_LIMIT, sortByRecent),
    }),
    [books],
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>{t("pages.homeTitle")}</h1>
        <p>{t("home.subtitle")}</p>
      </header>

      {isLoading ? (
        <div className={styles.loadingState}>
          <HomeSkeleton />
          <HomeSkeleton />
          <HomeSkeleton />
        </div>
      ) : isError ? (
        <div className={styles.empty}>{t("errors.booksLoad")}</div>
      ) : (
        <div className={styles.rails}>
          <BookCarousel
            title={t("sections.recommended")}
            books={recommendedBooks}
            isAuthed={isAuthenticated}
            emptyText={t("home.empty")}
          />
          <BookCarousel
            title={t("sections.popular")}
            books={popularBooks}
            isAuthed={isAuthenticated}
            emptyText={t("home.empty")}
          />
          <BookCarousel
            title={t("sections.new")}
            books={recentBooks}
            isAuthed={isAuthenticated}
            emptyText={t("home.empty")}
          />
        </div>
      )}
    </section>
  );
};

export default HomePage;
