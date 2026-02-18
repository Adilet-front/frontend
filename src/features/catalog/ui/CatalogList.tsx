import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCategories } from "../../../entities/category/api/categoryApi";
import { BookCard, type Book } from "../../../entities/book/ui/BookCard";
import { useAuth } from "../../auth/model/useAuth";
import {
  getCatalogBooks,
  type CatalogBook,
  type CatalogSort,
} from "../api/catalogApi";
import { Pagination } from "../../../shared/ui/Pagination/Pagination";
import styles from "./CatalogList.module.scss";

const PAGE_SIZE = 12;

type SortOption = {
  value: CatalogSort;
  label: string;
};

const toCardBook = (book: CatalogBook): Book => ({
  id: book.id,
  title: book.title,
  author: book.author,
  label: book.label,
  coverUrl: book.coverUrl,
  averageRating: book.averageRating,
  reviewCount: book.reviewCount,
  category: book.category,
  status: book.status,
});

const CatalogSkeleton = () => (
  <div className={styles.skeletonGrid} aria-hidden="true">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard} />
    ))}
  </div>
);

export const CatalogList = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [page, setPage] = useState(1);
  const [isCompactPagination, setIsCompactPagination] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    isFetching,
  } = useQuery({
    queryKey: ["catalog", searchQuery, selectedCategoryId, sort, page],
    queryFn: () =>
      getCatalogBooks(
        {
          format: "all",
          language: "all",
          categoryId: selectedCategoryId,
          searchQuery: searchQuery || undefined,
        },
        sort,
        page,
        PAGE_SIZE,
      ),
    placeholderData: keepPreviousData,
  });

  const { items = [], total = 0, totalPages = 1 } = catalogData ?? {};
  const currentPage = Math.min(page, totalPages);

  const books: Book[] = items.map(toCardBook);

  const selectedCategoryName = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId)?.name,
    [categories, selectedCategoryId],
  );

  const sortOptions: SortOption[] = useMemo(
    () => [
      { value: "popular", label: t("catalog.sorts.popular") },
      { value: "rating", label: t("catalog.sorts.rating") },
      { value: "new", label: t("catalog.sorts.new") },
    ],
    [t],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 820px)");
    const applyState = () => setIsCompactPagination(mediaQuery.matches);
    applyState();
    mediaQuery.addEventListener("change", applyState);
    return () => mediaQuery.removeEventListener("change", applyState);
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategoryId(undefined);
    setSort("popular");
    setPage(1);
  };

  return (
    <section className={styles.catalog}>
      <header className={styles.header}>
        <div>
          <h1>{t("pages.catalogTitle")}</h1>
          <p>{t("catalog.subtitle")}</p>
        </div>
        <button
          type="button"
          className={styles.filtersToggle}
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          aria-expanded={isFiltersOpen}
        >
          {t("catalog.filters")}
        </button>
      </header>

      <div className={styles.layout}>
        <aside
          className={styles.sidebar}
          data-open={isFiltersOpen ? "true" : "false"}
        >
          <div className={styles.sidebarBlock}>
            <h2>{t("catalog.filters")}</h2>
            <button
              type="button"
              className={styles.resetInline}
              onClick={handleReset}
            >
              {t("catalog.reset")}
            </button>
          </div>

          <div className={styles.sidebarBlock}>
            <p className={styles.sidebarTitle}>{t("catalog.genre")}</p>
            <div className={styles.categoryList}>
              <button
                type="button"
                className={
                  selectedCategoryId === undefined
                    ? styles.categoryActive
                    : styles.categoryButton
                }
                onClick={() => {
                  setSelectedCategoryId(undefined);
                  setPage(1);
                }}
              >
                {t("catalog.all")}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    selectedCategoryId === category.id
                      ? styles.categoryActive
                      : styles.categoryButton
                  }
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setPage(1);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.content}>
          <form className={styles.toolbar} onSubmit={handleSearchSubmit}>
            <label className={styles.searchField}>
              <span className="sr-only">{t("search.placeholder")}</span>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("search.placeholder")}
              />
            </label>

            <label className={styles.sortField}>
              <span className="sr-only">{t("catalog.sort")}</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as CatalogSort);
                  setPage(1);
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.searchButton}>
              {t("search.submitButton")}
            </button>
          </form>

          <div className={styles.metaRow}>
            <div>
              <span>{t("catalog.count", { count: total })}</span>
              {selectedCategoryName ? (
                <span className={styles.metaHint}>{selectedCategoryName}</span>
              ) : null}
            </div>
            {isFetching && !isLoading ? (
              <span className={styles.metaHint}>{t("catalog.updating")}</span>
            ) : null}
          </div>

          {isLoading ? (
            <CatalogSkeleton />
          ) : isError ? (
            <div className={styles.empty}>{t("errors.booksLoad")}</div>
          ) : books.length ? (
            <>
              <div className={styles.grid}>
                {books.map((book) => (
                  <BookCard key={book.id} book={book} isAuthed={isAuthenticated} />
                ))}
              </div>

              <div className={styles.paginationWrap}>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  compact={isCompactPagination}
                  ariaLabel={t("pagination.catalogAria")}
                />
              </div>
            </>
          ) : (
            <div className={styles.empty}>{t("catalog.empty")}</div>
          )}
        </div>
      </div>
    </section>
  );
};
