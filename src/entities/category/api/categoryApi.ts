/**
 * API категорий: список для фильтров каталога.
 */
import { apiClient } from "../../../shared/api/apiClient";
import type { Category } from "../model/types";

export type GetCategoriesResponse = Category[];

export const getCategories = () => apiClient.get<GetCategoriesResponse>("/categories");
