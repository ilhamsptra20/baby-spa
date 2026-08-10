import { create } from "zustand";

import type { AuthUser } from "@/ui/types/auth";

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
    }),
  setToken: (token) =>
    set({
      token,
      isAuthenticated: Boolean(token),
    }),
  setLoading: (isLoading) => set({ isLoading }),
  clearSession: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
