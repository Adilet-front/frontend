import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthGuard } from "../../features/auth/model/AuthGuard";
import { Loader } from "../../shared/ui/Loader";

// Lazy-loaded pages (route-level code splitting)
const CatalogPage = lazy(() => import("../../pages/catalog/CatalogPage"));
const BookPage = lazy(() => import("../../pages/book/BookPage"));
const ProfilePage = lazy(() => import("../../pages/profile/ProfilePage"));
const ProfileNotificationsPage = lazy(
  () => import("../../pages/profile/ProfileNotificationsPage"),
);
const LoginPage = lazy(() => import("../../pages/login/LoginPage"));
const ResetPasswordPage = lazy(
  () => import("../../pages/reset-password/ResetPasswordPage"),
);
const HomePage = lazy(() => import("../../pages/home/HomePage"));
const PopularPage = lazy(() => import("../../pages/popular/PopularPage"));
const MyBooksPage = lazy(() => import("../../pages/my/MyBooksPage"));
const WishlistPage = lazy(() => import("../../pages/wishlist/WishlistPage"));
const SearchPage = lazy(() => import("../../pages/search/SearchPage"));
const MyReservationsPage = lazy(
  () => import("../../pages/reservations/MyReservationsPage"),
);

// Admin Pages
const AdminDashboardPage = lazy(
  () => import("../../pages/admin/AdminDashboardPage"),
);
const UsersManagementPage = lazy(
  () => import("../../pages/admin/UsersManagementPage"),
);
const BooksManagementPage = lazy(
  () => import("../../pages/admin/BooksManagementPage"),
);
const CategoriesManagementPage = lazy(
  () => import("../../pages/admin/CategoriesManagementPage"),
);
const OverdueReservationsPage = lazy(
  () => import("../../pages/admin/OverdueReservationsPage"),
);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginPage mode="login" />} />
          <Route
            path="/auth/register"
            element={<LoginPage mode="register" />}
          />
          <Route
            path="/auth/reset-password"
            element={<ResetPasswordPage />}
          />
        </Route>

        <Route element={<AuthGuard />}>
          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/books" element={<BooksManagementPage />} />
            <Route
              path="/admin/categories"
              element={<CategoriesManagementPage />}
            />
            <Route path="/admin/overdue" element={<OverdueReservationsPage />} />
          </Route>

          <Route element={<AppLayout />}>
            {/* Add new pages here and reuse translations from app/i18n/resources.ts */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/book/:id" element={<BookPage />} />
            <Route path="/popular" element={<PopularPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/profile/notifications"
              element={<ProfileNotificationsPage />}
            />
            <Route path="/reservations" element={<MyReservationsPage />} />
            <Route path="/my" element={<MyBooksPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
