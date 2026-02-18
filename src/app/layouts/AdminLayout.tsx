/**
 * Layout для админ панели
 */
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../features/auth/model/useAuth";
import "../styles/admin.css";

export const AdminLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const roleLabel: Record<string, string> = {
    ADMIN: t("admin.roles.admin"),
    USER: t("admin.roles.user"),
  };

  // Проверка прав админа
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const navLinks = [
    { path: "/admin", label: t("admin.nav.dashboard"), icon: "📊" },
    { path: "/admin/users", label: t("admin.nav.users"), icon: "👥" },
    { path: "/admin/books", label: t("admin.nav.books"), icon: "📚" },
    { path: "/admin/categories", label: t("admin.nav.categories"), icon: "🏷️" },
    { path: "/admin/overdue", label: t("admin.nav.overdue"), icon: "⏰" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/admin">
            <h2>📚 {t("admin.layout.title")}</h2>
          </Link>
        </div>
        <nav className="admin-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav-link ${isActive(link.path) ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="back-to-site">
            ← {t("admin.layout.backToSite")}
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-user-info">
            <span>
              {user.firstName} {user.lastName}
            </span>
            <span className="user-role">{roleLabel[user.role] ?? user.role}</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
