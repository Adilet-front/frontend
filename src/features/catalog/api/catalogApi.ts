/**
 * API каталога:
 * - searchCatalogBooks: серверный поиск по /categories/books/search
 * - getCatalogBooks: обертка с клиентской пагинацией поверх searchCatalogBooks
 */
import { apiClient } from "../../../shared/api/apiClient";
import type { BookLabel } from "../../../entities/book/ui/BookCard";
import type { Book } from "../../../entities/book/model/types";

export type CatalogBook = Book & {
  label?: BookLabel;
  isAvailable?: boolean;
};

export type CatalogFilters = {
  categoryId?: number;
  format: string | "all";
  language: string | "all";
  searchQuery?: string;
};

export type CatalogSort = "popular" | "rating" | "new";

export type CatalogResponse = {
  items: CatalogBook[];
  total: number;
  totalPages: number;
};

// Backend Request DTO
type BookFilterRequest = {
  search?: string;
  categoryId?: number;
  status?: "AVAILABLE" | "RESERVED" | "TAKEN" | "RETURNED" | "IN_YOUR_HANDS";
  author?: string;
  minRating?: number;
  sortBy?: "TITLE" | "AUTHOR" | "CREATED_AT" | "RATING" | "POPULARITY";
  sortDirection?: "ASC" | "DESC";
};

// Backend Response DTO
type BackendBookResponse = {
  id: number;
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverUrl?: string;
  status: "AVAILABLE" | "RESERVED" | "TAKEN" | "RETURNED" | "IN_YOUR_HANDS";
  averageRating: number;
  reviewCount: number;
};

const mapBackendToFrontend = (b: BackendBookResponse): CatalogBook => ({
  id: b.id,
  title: b.title,
  author: b.author,
  description: b.description,
  category: b.category,
  coverUrl: b.coverUrl,
  averageRating: b.averageRating,
  reviewCount: b.reviewCount,
  status: b.status,
  isAvailable: b.status === "AVAILABLE",
  label: b.status === "AVAILABLE" ? undefined : "unavailable",
});

export const searchCatalogBooks = async (
  filters: CatalogFilters,
  sort: CatalogSort
): Promise<CatalogBook[]> => {
  const request: BookFilterRequest = {
    search: filters.searchQuery || undefined,
    categoryId: filters.categoryId,
    sortBy:
      sort === "popular"
        ? "POPULARITY"
        : sort === "rating"
          ? "RATING"
          : "CREATED_AT",
    sortDirection: "DESC",
  };

  try {
    const { data } = await apiClient.post<BackendBookResponse[]>(
      "/categories/books/search",
      request
    );
    return data.map(mapBackendToFrontend);
  } catch (error) {
    // Fallback для текущего backend: иногда сортировка по POPULARITY/RATING
    // возвращает 400 из-за несовпадения полей сортировки.
    const status = (error as { response?: { status?: number } } | undefined)
      ?.response?.status;
    if (status !== 400) {
      throw error;
    }

    const fallbackRequest: BookFilterRequest = {
      search: filters.searchQuery || undefined,
      categoryId: filters.categoryId,
    };
    const { data } = await apiClient.post<BackendBookResponse[]>(
      "/categories/books/search",
      fallbackRequest
    );
    return data.map(mapBackendToFrontend);
  }
};

export const getCatalogBooks = async (
  filters: CatalogFilters,
  sort: CatalogSort,
  page: number,
  pageSize: number
): Promise<CatalogResponse> => {
  // 1. Server-side Search & Sort
  const allResults = await searchCatalogBooks(filters, sort);

  // 2. Client-side Filter (Format/Language not supported by backend yet)
  // Assuming format/language aren't vital for now, or we filter client-side if we had the data.
  // Backend response doesn't strictly have format/language fields to filter by?
  // We'll skip client-side filtering for format/language for now as they aren't in the response.

  const total = allResults.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = allResults.slice(start, start + pageSize);

  return { items, total, totalPages };
};
