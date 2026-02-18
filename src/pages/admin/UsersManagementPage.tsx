/**
 * Страница управления пользователями (Admin)
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAllUsers, approveUser } from "../../entities/admin/api/adminApi";
import type { UserResponse } from "../../entities/user/model/types";
import "../../app/styles/admin.css";

type FilterTab = "all" | "pending" | "approved";

export const UsersManagementPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (enabled?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAllUsers(enabled);
      setUsers(data);
    } catch (err) {
      setError(t("admin.users.errors.load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === "all") {
      loadUsers();
    } else if (filter === "pending") {
      loadUsers(false);
    } else {
      loadUsers(true);
    }
  }, [filter]);

  const handleApprove = async (userId: number) => {
    try {
      await approveUser(userId);
      // Перезагрузить список
      loadUsers(filter === "all" ? undefined : filter === "approved");
    } catch (err) {
      alert(t("admin.users.errors.approve"));
      console.error(err);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "badge-admin",
      USER: "badge-user",
    };
    return colors[role] || "badge-default";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: t("admin.roles.admin"),
      USER: t("admin.roles.user"),
    };
    return labels[role] || role;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{t("admin.users.title")}</h1>
        <p>{t("admin.users.subtitle")}</p>
      </div>

      <div className="admin-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {t("admin.users.filters.all")}
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          {t("admin.users.filters.pending")}
        </button>
        <button
          className={`filter-btn ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          {t("admin.users.filters.approved")}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">{t("common.loading")}</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("admin.users.table.name")}</th>
                <th>{t("admin.users.table.email")}</th>
                <th>{t("admin.users.table.role")}</th>
                <th>{t("admin.users.table.status")}</th>
                <th>{t("admin.users.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${user.enabled ? "badge-success" : "badge-warning"}`}
                    >
                      {user.enabled
                        ? t("admin.users.status.approved")
                        : t("admin.users.status.pending")}
                    </span>
                  </td>
                  <td>
                    {!user.enabled && (
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(user.id)}
                      >
                        {t("admin.users.actions.approve")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="empty-state">
              <p>{t("admin.users.empty")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
