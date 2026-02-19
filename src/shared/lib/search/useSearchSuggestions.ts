import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCatalogBooks,
  type CatalogBook,
} from "../../../features/catalog/api/catalogApi";

export type SearchSuggestion = {
  id: string;
  primary: string;
  secondary?: string;
  query: string;
};

type UseSearchSuggestionsParams = {
  term: string;
  isAuthed: boolean;
  isActive: boolean;
};

type UseSearchSuggestionsResult = {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isError: boolean;
};

const BOOKS_LIMIT = 8;
const TOTAL_LIMIT = 8;

const mapBookSuggestions = (items: CatalogBook[]): SearchSuggestion[] => {
  const bookSuggestions: SearchSuggestion[] = [];

  for (const item of items) {
    const title = item.title?.trim() ?? "";
    if (!title) {
      continue;
    }

    bookSuggestions.push({
      id: `book:${item.id}`,
      primary: title,
      secondary: item.author?.trim() || undefined,
      query: title,
    });

    if (bookSuggestions.length >= BOOKS_LIMIT) {
      break;
    }
  }

  return bookSuggestions;
};

const mapSuggestions = (items: CatalogBook[]): SearchSuggestion[] => {
  const books = mapBookSuggestions(items);
  return books.slice(0, TOTAL_LIMIT);
};

export const useSearchSuggestions = ({
  term,
  isAuthed,
  isActive,
}: UseSearchSuggestionsParams): UseSearchSuggestionsResult => {
  const normalizedTerm = useMemo(() => term.trim(), [term]);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["searchSuggestions", normalizedTerm || "__popular__"],
    queryFn: async () => {
      const response = await getCatalogBooks(
        {
          format: "all",
          language: "all",
          searchQuery: normalizedTerm || undefined,
        },
        "popular",
        1,
        12,
      );
      return mapSuggestions(response.items);
    },
    enabled: isAuthed && isActive,
    staleTime: 30_000,
  });

  return {
    suggestions: data,
    isLoading,
    isError,
  };
};
