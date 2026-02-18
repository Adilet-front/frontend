/**
 * Хранение access-токена в localStorage (ключ office_lib_access_token).
 * Используется apiClient и после логина/регистрации. Сессия сохраняется между перезапусками браузера.
 */
const ACCESS_TOKEN_KEY = "office_lib_access_token";

const isBrowser = () => typeof window !== "undefined";

export const getAccessToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (accessToken: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearTokens = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};
