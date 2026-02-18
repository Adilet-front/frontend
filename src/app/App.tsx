/**
 * Корневой компонент: оборачивает приложение в провайдеры и роутер.
 * Порядок: ErrorBoundary (ловит ошибки) → QueryProvider (React Query) → роуты.
 */
import { ErrorBoundary } from "./providers/ErrorBoundary";
import { QueryProvider } from "./providers/QueryProvider";
import { AppRouter } from "./router";

export const App = () => (
  <ErrorBoundary>
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  </ErrorBoundary>
);
