/**
 * Страница управления категориями (Admin)
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  createCategory,
  getAllCategories,
  type CategoryRequest,
  type Category,
} from "../../entities/admin/api/adminApi";
import "../../app/styles/admin.css";

export const CategoriesManagementPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CategoryRequest>({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(t("admin.categories.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCategory(formData);
      setShowModal(false);
      setFormData({ name: "", description: "" });
      loadCategories();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        alert(t("admin.categories.errors.exists"));
      } else {
        alert(t("admin.categories.errors.create"));
      }
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>{t("admin.categories.title")}</h1>
          <p>{t("admin.categories.subtitle")}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + {t("admin.categories.actions.add")}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">{t("common.loading")}</div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-icon">📚</div>
              <div className="category-info">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {categories.length === 0 && !loading && (
        <div className="empty-state">
          <p>{t("admin.categories.empty")}</p>
        </div>
      )}

      {/* Modal для создания категории */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("admin.categories.modal.title")}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">{t("admin.categories.fields.name")} *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("admin.categories.fields.namePlaceholder")}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">{t("admin.categories.fields.description")}</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("admin.categories.fields.descriptionPlaceholder")}
                  rows={4}
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
                  {t("admin.categories.actions.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagementPage;
