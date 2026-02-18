/**
 * API книг: список и одна книга по id.
 */
import { apiClient } from "../../../shared/api/apiClient";
import type { Book } from "../model/types";

export const getBooks = async (): Promise<Book[]> => {
  const { data } = await apiClient.get<Book[]>("/books");
  return data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const { data } = await apiClient.get<Book>(`/books/${id}`);
  return data;
};
