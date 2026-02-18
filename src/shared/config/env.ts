/**
 * Конфиг из переменных окружения (Vite: import.meta.env.VITE_*).
 * apiBaseUrl — бэкенд API; coverBaseUrl — базовый URL обложек книг.
 */
type EnvConfig = {
  apiBaseUrl: string;
  coverBaseUrl: string;
};

export const getEnv = (): EnvConfig => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  coverBaseUrl: import.meta.env.VITE_COVER_BASE_URL ?? "",
});
