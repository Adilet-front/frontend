import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getBooks } from "../../entities/book/api/bookApi";
import { getCategories } from "../../entities/category/api/categoryApi";
import { BookCard, type Book } from "../../entities/book/ui/BookCard";
import { useBookingStore } from "../../features/book/model/bookingStore";
import { Input } from "../../shared/ui/Input/Input";
import { Select } from "../../shared/ui/Select/Select";
import { Pagination } from "../../shared/ui/Pagination/Pagination";
import styles from "./WishlistPage.module.scss";

const PAGE_SIZE = 8;

export const WishlistPage = () => {
  const { t } = useTranslation();
  const bookings = useBookingStore((state) => state.bookings);
  const removeWish = useBookingStore((state) => state.removeWish);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [isCompactPagination, setIsCompactPagination] = useState(false);

  const { data: apiBooks = [] } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await getCategories();
      return data;
    },
  });

  const wishlistItems = useMemo(
    () =>
      bookings.filter(
        (item) =>
          item.active &&
          item.readingStatus === "WILL_READ" &&
          !item.bookedAt &&
          !item.borrowedAt,
      ),
    [bookings],
  );

  const books: Book[] = useMemo(() => {
    if (!wishlistItems.length) {
      return [];
    }

    const apiById = new Map(apiBooks.map((book) => [book.id, book]));
    const snapshotById = new Map(
      wishlistItems.map((item) => [item.bookSnapshot.id, item.bookSnapshot]),
    );

    const mergedBooks: Book[] = [];
    for (const item of wishlistItems) {
      const apiBook = apiById.get(item.bookSnapshot.id);
      if (apiBook) {
        mergedBooks.push({
          id: apiBook.id,
          title: apiBook.title,
          author: apiBook.author,
          coverUrl: apiBook.coverUrl,
          category: apiBook.category,
          averageRating: apiBook.averageRating,
          reviewCount: apiBook.reviewCount,
          status: apiBook.status,
        });
        continue;
      }

      const snapshot = snapshotById.get(item.bookSnapshot.id);
      if (snapshot) {
        mergedBooks.push({
          id: snapshot.id,
          title: snapshot.title,
          author: snapshot.author,
          coverUrl: snapshot.coverUrl,
          category: snapshot.category,
          label: snapshot.label,
        });
      }
    }

    return mergedBooks;
  }, [apiBooks, wishlistItems]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
    const selectedCategoryName = categoryNameById.get(selectedCategoryId);

    return books.filter((book) => {
      const matchesCategory =
        selectedCategoryId === "all" ||
        (selectedCategoryName && book.category === selectedCategoryName);

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const title = book.title.toLocaleLowerCase();
      const author = book.author.toLocaleLowerCase();
      const category = (book.category ?? "").toLocaleLowerCase();
      return (
        title.includes(normalizedSearch) ||
        author.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });
  }, [books, categoryNameById, searchQuery, selectedCategoryId]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: t("catalog.all") },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories, t],
  );

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = useMemo(
    () =>
      filteredBooks.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredBooks],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const applyState = () => setIsCompactPagination(mediaQuery.matches);
    applyState();
    mediaQuery.addEventListener("change", applyState);
    return () => mediaQuery.removeEventListener("change", applyState);
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>{t("pages.wishlistTitle")}</h1>
        <p>{t("wishlist.subtitle")}</p>
      </div>

      <div className={styles.filters}>
        <Input
          className={styles.searchField}
          type="search"
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPage(1);
          }}
        />
        <Select
          className={styles.categoryField}
          value={selectedCategoryId}
          onChange={(event) => {
            setSelectedCategoryId(event.target.value);
            setPage(1);
          }}
          options={categoryOptions}
        />
      </div>

      <div className={styles.meta}>{t("catalog.count", { count: filteredBooks.length })}</div>

      <div className={styles.grid}>
        {pagedBooks.length ? (
          pagedBooks.map((book) => (
            <div key={book.id} className={styles.cardWrap}>
              <BookCard book={book} isAuthed />
              <div className={styles.actions}>
                <Link to={`/book/${book.id}`} className={styles.linkButton} state={{ book }}>
                  {t("wishlist.openBook")}
                </Link>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeWish(book.id)}
                >
                  {t("wishlist.remove")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>{t("wishlist.empty")}</p>
        )}
      </div>

      {filteredBooks.length > 0 && totalPages > 1 ? (
        <div className={styles.pagination}>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            compact={isCompactPagination}
            onPageChange={setPage}
            ariaLabel={t("pagination.wishlistAria")}
          />
        </div>
      ) : null}
    </section>
  );
};

export default WishlistPage;
