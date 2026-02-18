import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCategories } from "../../entities/category/api/categoryApi";
import { getCatalogBooks } from "../../features/catalog/api/catalogApi";
import { useAuth } from "../../features/auth/model/useAuth";
import { getUserReservations } from "../../entities/booking/api/bookingApi";
import { BookCard, type Book } from "../../entities/book/ui/BookCard";
import { SearchInput } from "../../shared/ui/SearchInput/SearchInput";
import { Select } from "../../shared/ui/Select/Select";
import { Pagination } from "../../shared/ui/Pagination/Pagination";
import styles from "./SearchPage.module.scss";

const PAGE_SIZE = 8;

const buildSearchPath = (query: string, categoryId: string, page = 1) => {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  if (categoryId !== "all") {
    params.set("categoryId", categoryId);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : "/search";
};

export const SearchPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isCompactPagination, setIsCompactPagination] = useState(false);

  const query = params.get("q")?.trim() ?? "";
  const categoryParam = params.get("categoryId") ?? "all";
  const pageParam = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const parsedCategoryId =
    categoryParam !== "all" && Number.isFinite(Number(categoryParam))
      ? Number(categoryParam)
      : undefined;
  const hasFilters = query.length > 0 || parsedCategoryId !== undefined;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await getCategories();
      return data;
    },
    staleTime: 60_000,
  });

  const {
    data: catalogData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", query, parsedCategoryId, page],
    queryFn: () =>
      getCatalogBooks(
        {
          format: "all",
          language: "all",
          searchQuery: query || undefined,
          categoryId: parsedCategoryId,
        },
        "popular",
        page,
        PAGE_SIZE,
      ),
    enabled: hasFilters,
    placeholderData: keepPreviousData,
  });

  const { items = [], total = 0, totalPages = 1 } = catalogData ?? {};
  const currentPage = Math.min(page, totalPages);

  const books: Book[] = items.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    label: book.label,
    coverUrl: book.coverUrl,
    category: book.category,
    averageRating: book.averageRating,
    reviewCount: book.reviewCount,
    status: book.status,
  }));

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

  const { data: myReservations = [] } = useQuery({
    queryKey: ["reservations", "my"],
    queryFn: async () => {
      const { data } = await getUserReservations();
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  const myBookIds = useMemo(
    () => new Set(myReservations.map((item) => item.bookId)),
    [myReservations],
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

  const handleSearch = (term: string) => {
    navigate(buildSearchPath(term, categoryParam, 1));
  };

  const handleCategoryChange = (value: string) => {
    navigate(buildSearchPath(query, value, 1));
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("pages.searchTitle")}</h1>
          <p>{hasFilters ? t("catalog.count", { count: total }) : t("search.startHint")}</p>
        </div>
        <div className={styles.controls}>
          <SearchInput
            value={query}
            isAuthed={isAuthenticated}
            onSearch={handleSearch}
          />
          <Select
            className={styles.categorySelect}
            value={categoryParam}
            onChange={(event) => handleCategoryChange(event.target.value)}
            options={categoryOptions}
          />
        </div>
      </header>

      {!hasFilters ? (
        <div className={styles.empty}>{t("search.empty")}</div>
      ) : isLoading ? (
        <div className={styles.empty}>{t("common.loading")}</div>
      ) : isError ? (
        <div className={styles.empty}>{t("errors.booksLoad")}</div>
      ) : books.length ? (
        <>
          <div className={styles.grid}>
            {books.map((book) => (
              <article key={book.id} className={styles.gridItem}>
                <BookCard book={book} isAuthed={isAuthenticated} />
                {myBookIds.has(book.id) ? (
                  <span className={styles.inMyBooks}>{t("search.inMyBooks")}</span>
                ) : null}
              </article>
            ))}
          </div>

          <div className={styles.pagination}>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              compact={isCompactPagination}
              onPageChange={(targetPage) =>
                navigate(buildSearchPath(query, categoryParam, targetPage))
              }
              ariaLabel={t("pagination.searchAria")}
            />
          </div>
        </>
      ) : (
        <div className={styles.empty}>{t("catalog.empty")}</div>
      )}
    </section>
  );
};

export default SearchPage;
