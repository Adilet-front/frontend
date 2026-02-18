import type { Book } from "../../../entities/book/model/types";
import type { Category } from "../../../entities/category/model/types";

type CatalogFilters = {
  searchQuery?: string;
  categoryId?: string;
};

export type CatalogViewModel = {
  items: Book[];
  categories: Category[];
  filters: CatalogFilters;
};
