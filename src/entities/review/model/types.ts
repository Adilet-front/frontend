/** Модель отзыва (ответ backend /review/{id}/reviews) */
export type Review = {
  id: number;
  userEmail: string;
  rating: number;
  comment?: string;
  createdAt: string;
};
