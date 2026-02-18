/**
 * Хук авторизации: isAuthenticated, user, signIn, signOut.
 * При наличии токена и незагруженном профиле автоматически вызывает loadProfile().
 */
import { useEffect } from "react";
import type { User } from "../../../entities/user/model/types";
import { useAuthStore } from "./authStore";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (payload?: { email?: string }) => Promise<void>;
  signOut: () => void;
};

export const useAuth = (): AuthState => {
  const { isAuthed, user, signIn, signOut, loadProfile, profileLoaded } =
    useAuthStore();

  useEffect(() => {
    if (isAuthed && !profileLoaded) void loadProfile();
  }, [isAuthed, loadProfile, profileLoaded]);

  return { isAuthenticated: isAuthed, user, signIn, signOut };
};
