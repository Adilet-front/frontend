/** Статус экземпляра книги с бэкенда */
export type BookStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "TAKEN"
  | "RETURNED"
  | "IN_YOUR_HANDS";

/** Модель книги (ответ API /books, /books/:id) */
export type Book = {
  id: number;
  title: string;
  author: string;
  description?: string;
  category?: string;
  location?: string;
  coverUrl?: string;
  status?: BookStatus;
  averageRating?: number;
  reviewCount?: number;
};
