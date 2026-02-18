/**
 * Главная страница админ панели (Dashboard)
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllUsers, getAllCategories } from "../../entities/admin/api/adminApi";
import { getBooks } from "../../entities/book/api/bookApi";
import "../../app/styles/admin.css";

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalBooks: 0,
    availableBooks: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allUsers, pendingUsers, books, categories] = await Promise.all([
          getAllUsers(),
          getAllUsers(false),
          getBooks(),
          getAllCategories(),
        ]);

        const availableBooks = books.filter(
          (b: any) => b.status === "AVAILABLE"
        ).length;

        setStats({
          totalUsers: allUsers.data.length,
          pendingUsers: pendingUsers.data.length,
          totalBooks: books.length,
          availableBooks,
          totalCategories: categories.data.length,
        });
      } catch (err) {
        console.error(t("admin.dashboard.errors.load"), err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="loading-spinner">{t("common.loading")}</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{t("admin.dashboard.title")}</h1>
        <p>{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="stats-grid">
        <Link to="/admin/users" className="stat-card stat-users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">{t("admin.dashboard.stats.users")}</div>
            {stats.pendingUsers > 0 && (
              <div className="stat-badge">
                {t("admin.dashboard.stats.pending", { count: stats.pendingUsers })}
              </div>
            )}
          </div>
        </Link>

        <Link to="/admin/books" className="stat-card stat-books">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalBooks}</div>
            <div className="stat-label">{t("admin.dashboard.stats.books")}</div>
            <div className="stat-badge">
              {t("admin.dashboard.stats.available", { count: stats.availableBooks })}
            </div>
          </div>
        </Link>

        <Link to="/admin/categories" className="stat-card stat-categories">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalCategories}</div>
            <div className="stat-label">{t("admin.dashboard.stats.categories")}</div>
          </div>
        </Link>
      </div>

      <div className="quick-actions">
        <h2>{t("admin.dashboard.quickActions.title")}</h2>
        <div className="actions-grid">
          <Link to="/admin/books" className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-text">{t("admin.dashboard.quickActions.addBook")}</span>
          </Link>
          <Link to="/admin/categories" className="action-card">
            <span className="action-icon">🏷️</span>
            <span className="action-text">{t("admin.dashboard.quickActions.createCategory")}</span>
          </Link>
          <Link to="/admin/users" className="action-card">
            <span className="action-icon">✅</span>
            <span className="action-text">
              {t("admin.dashboard.quickActions.approveUsers")}
              {stats.pendingUsers > 0 && ` (${stats.pendingUsers})`}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
