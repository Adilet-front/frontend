/**
 * API авторизации: логин и регистрация (без токена в запросе).
 * Ответ приходит с токеном: { token: string }. Токен сохраняем в sessionStorage и вызываем signIn().
 */
import type { AxiosResponse } from "axios";
import { apiClient } from "../../../shared/api/apiClient";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../model/types";

/** Логин по email + password. Ответ с токеном: data.token */
export const login = (payload: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
  apiClient.post<LoginResponse>("/auth/login", payload);

/** Регистрация (email + password + avatar). Ответ с сообщением о pending approval */
export const register = (payload: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> => {
  // Если есть avatar, отправляем как FormData
  if (payload.avatar) {
    const formData = new FormData();
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("avatar", payload.avatar);
    
    // Не устанавливаем Content-Type вручную, axios установит его автоматически с boundary
    return apiClient.post<RegisterResponse>("/auth/register", formData);
  }
  
  // Если нет avatar, отправляем как обычный JSON
  return apiClient.post<RegisterResponse>("/auth/register", {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
  });
};

/** Запрос на отправку ссылки для восстановления пароля */
export const forgotPassword = (
  payload: ForgotPasswordRequest,
): Promise<AxiosResponse<ForgotPasswordResponse>> =>
  apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", payload);

/** Установка нового пароля по токену */
export const resetPassword = (
  payload: ResetPasswordRequest,
): Promise<AxiosResponse<ResetPasswordResponse>> =>
  apiClient.post<ResetPasswordResponse>("/auth/reset-password", payload);
