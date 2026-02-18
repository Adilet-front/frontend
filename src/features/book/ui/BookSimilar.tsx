import { useTranslation } from "react-i18next";
import { BookCarousel } from "../../../widgets/home/BookCarousel";
import type { Book } from "../../../entities/book/ui/BookCard";

type BookSimilarProps = {
  books: Book[];
  isAuthed: boolean;
};

export const BookSimilar = ({ books, isAuthed }: BookSimilarProps) => {
  const { t } = useTranslation();

  return (
    <BookCarousel
      title={t("book.similar")}
      books={books}
      isAuthed={isAuthed}
    />
  );
};
