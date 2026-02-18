import { apiClient } from "../../../shared/api/apiClient";
import type { Review } from "../model/types";

export type ReviewUpsertRequest = {
  rating: number;
  comment: string;
};

export const upsertBookReview = (bookId: number, payload: ReviewUpsertRequest) =>
  apiClient.post<Review>(`/review/${bookId}/reviews`, payload);

export const createReview = (bookId: number, payload: ReviewUpsertRequest) =>
  upsertBookReview(bookId, payload);

export const getBookReviews = (bookId: number) =>
  apiClient.get<Review[]>(`/review/${bookId}/reviews`);

// Available for future UI flows; current user app relies on POST upsert.
export const updateReviewById = (reviewId: number, payload: ReviewUpsertRequest) =>
  apiClient.put<Review>(`/review/${reviewId}`, payload);

// Available for future UI flows; delete is intentionally hidden in UI for now.
export const deleteReviewById = (reviewId: number) =>
  apiClient.delete<void>(`/review/${reviewId}`);
