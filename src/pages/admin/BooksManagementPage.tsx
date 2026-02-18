/**
 * Страница управления книгами (Admin)
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  createBook,
  deleteBook,
  softDeleteBook,
  uploadBookCover,
  getAllCategories,
  type BookCreateRequest,
  type BookResponse,
  type Category,
} from "../../entities/admin/api/adminApi";
import { getBooks } from "../../entities/book/api/bookApi";
import "../../app/styles/admin.css";

export const BooksManagementPage = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<BookCreateRequest>({
    title: "",
    author: "",
    description: "",
    categoryId: 0,
    location: "",
  });
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: t("book.status.available"),
      RESERVED: t("book.status.reserved"),
      TAKEN: t("book.status.taken"),
      RETURNED: t("book.status.returned"),
      IN_YOUR_HANDS: t("book.status.taken"),
    };
    return labels[status] || status;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [books, categoriesRes] = await Promise.all([
        getBooks(),
        getAllCategories(),
      ]);
      // Преобразуем Book[] в BookResponse[]
      const booksData: BookResponse[] = books.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author || "",
        description: book.description,
        category: book.category || "",
        location: book.location || "",
        coverUrl: book.coverUrl,
        status: book.status || "AVAILABLE",
      }));
      setBooks(booksData);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(t("admin.books.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert(t("admin.books.errors.selectCategory"));
      return;
    }

    try {
      const { data: newBook } = await createBook(formData);

      // Если есть обложка, загружаем её
      if (selectedCover) {
        await uploadBookCover(newBook.id, selectedCover);
      }

      setShowModal(false);
      setFormData({
        title: "",
        author: "",
        description: "",
        categoryId: 0,
        location: "",
      });
      setSelectedCover(null);
      loadData();
    } catch (err) {
      alert(t("admin.books.errors.create"));
      console.error(err);
    }
  };

  const handleDelete = async (bookId: number, hard: boolean = false) => {
    if (
      !confirm(
        t("admin.books.confirmDelete", {
          action: hard
            ? t("admin.books.actions.delete")
            : t("admin.books.actions.archive"),
        }),
      )
    ) {
      return;
    }

    try {
      if (hard) {
        await deleteBook(bookId);
      } else {
        await softDeleteBook(bookId);
      }
      loadData();
    } catch (err) {
      alert(t("admin.books.errors.delete"));
      console.error(err);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedCover(e.target.files[0]);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "badge-success",
      RESERVED: "badge-warning",
      TAKEN: "badge-info",
      RETURNED: "badge-default",
    };
    return colors[status] || "badge-default";
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>{t("admin.books.title")}</h1>
          <p>{t("admin.books.subtitle")}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + {t("admin.books.actions.add")}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">{t("common.loading")}</div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} />
                ) : (
                  <div className="book-cover-placeholder">{t("admin.books.noCover")}</div>
                )}
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <p className="book-category">{book.category}</p>
                <p className="book-location">📍 {book.location}</p>
                <span className={`badge ${getStatusBadge(book.status)}`}>
                  {getStatusLabel(book.status)}
                </span>
              </div>
              <div className="book-actions">
                <button
                  className="btn-archive"
                  onClick={() => handleDelete(book.id, false)}
                >
                  {t("admin.books.actions.archive")}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(book.id, true)}
                >
                  {t("admin.books.actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="empty-state">
          <p>{t("admin.books.empty")}</p>
        </div>
      )}

      {/* Modal для создания книги */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("admin.books.modal.title")}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">{t("admin.books.fields.title")} *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">{t("admin.books.fields.author")} *</label>
                <input
                  id="author"
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">{t("admin.books.fields.description")}</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">{t("admin.books.fields.category")} *</label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value="0">{t("admin.books.fields.categoryPlaceholder")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">{t("admin.books.fields.location")} *</label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder={t("admin.books.fields.locationPlaceholder")}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cover">{t("admin.books.fields.cover")}</label>
                <input
                  id="cover"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleCoverChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn-primary">
                  {t("admin.books.actions.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManagementPage;
