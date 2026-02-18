import type { Book } from "../../../entities/book/model/types";
import type { Review } from "../../../entities/review/model/types";

type ReviewSummary = {
  averageRating: number;
  total: number;
};

export type BookDetailsViewModel = {
  book: Book;
  reviews: Review[];
  rating: ReviewSummary;
};
