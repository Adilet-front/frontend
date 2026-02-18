/**
 * API профиля пользователя.
 */
import { apiClient } from "../../../shared/api/apiClient";
import type { User } from "../model/types";

export const getProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<User>("/api/profile/me");
  return data;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<User> => {
  const { data } = await apiClient.put<User>("/api/profile/update", payload);
  return data;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<string>("/api/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const requestEmailUpdate = async (newEmail: string): Promise<string> => {
  const { data } = await apiClient.post<string>("/api/profile/update-email", null, {
    params: { newEmail },
  });
  return data;
};
