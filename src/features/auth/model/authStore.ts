/**
 * Zustand-стор авторизации: есть ли токен, профиль пользователя, загрузка профиля.
 * signIn — после логина/регистрации (токен уже в localStorage); loadProfile подтягивает /api/profile/me.
 */
import { create } from "zustand";
import type { User } from "../../../entities/user/model/types";
import { getProfile } from "../../../entities/user/api/userApi";
import { clearTokens, getAccessToken } from "../../../shared/lib/auth/token";

type AuthState = {
  isAuthed: boolean;
  user: User | null;
  profileLoaded: boolean;
  loadProfile: () => Promise<void>;
  signIn: (payload?: { email?: string }) => Promise<void>;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthed: Boolean(getAccessToken()),
  user: null,
  profileLoaded: false,
  loadProfile: async () => {
    if (!getAccessToken()) {
      set(() => ({ isAuthed: false, user: null, profileLoaded: false }));
      return;
    }
    set(() => ({ profileLoaded: true }));
    try {
      const profile = await getProfile();
      set(() => ({ isAuthed: true, user: profile }));
    } catch {
      clearTokens();
      set(() => ({ isAuthed: false, user: null, profileLoaded: false }));
    }
  },
  signIn: async (_payload) => {
    set(() => ({ isAuthed: true, profileLoaded: true }));
    try {
      const profile = await getProfile();
      set(() => ({ user: profile }));
    } catch {
      set(() => ({ user: null }));
    }
  },
  signOut: () => {
    clearTokens();
    set(() => ({ isAuthed: false, user: null, profileLoaded: false }));
  },
}));
