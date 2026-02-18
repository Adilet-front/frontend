/**
 * Admin API: управление пользователями, книгами, категориями
 */
import type { AxiosResponse } from "axios";
import { apiClient } from "../../../shared/api/apiClient";
import type { UserResponse } from "../../user/model/types";

/** Получить список всех пользователей с фильтрацией */
export const getAllUsers = (enabled?: boolean): Promise<AxiosResponse<UserResponse[]>> => {
  const params = enabled !== undefined ? { enabled } : {};
  return apiClient.get<UserResponse[]>("/admin/users", { params });
};

/** Одобрить пользователя (разрешить вход) */
export const approveUser = (userId: number): Promise<AxiosResponse<void>> =>
  apiClient.patch<void>(`/auth/admin/users/${userId}/approve`);

/** Создать книгу */
export interface BookCreateRequest {
  title: string;
  author: string;
  description?: string;
  categoryId: number;
  location: string;
}

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  description?: string;
  category: string;
  location: string;
  coverUrl?: string;
  status: "AVAILABLE" | "RESERVED" | "TAKEN" | "RETURNED";
}

export const createBook = (data: BookCreateRequest): Promise<AxiosResponse<BookResponse>> =>
  apiClient.post<BookResponse>("/books/admin/create", data);

/** Загрузить обложку для книги */
export const uploadBookCover = (bookId: number, file: File): Promise<AxiosResponse<BookResponse>> => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<BookResponse>(`/books/${bookId}/cover`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/** Удалить книгу */
export const deleteBook = (bookId: number): Promise<AxiosResponse<void>> =>
  apiClient.delete<void>(`/books/admin/${bookId}`);

/** Архивировать книгу (мягкое удаление) */
export const softDeleteBook = (bookId: number): Promise<AxiosResponse<void>> =>
  apiClient.patch<void>(`/books/admin/soft-delete/${bookId}`);

/** Создать категорию */
export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export const createCategory = (data: CategoryRequest): Promise<AxiosResponse<Category>> =>
  apiClient.post<Category>("/categories", data);

/** Получить все категории */
export const getAllCategories = (): Promise<AxiosResponse<Category[]>> =>
  apiClient.get<Category[]>("/categories");
