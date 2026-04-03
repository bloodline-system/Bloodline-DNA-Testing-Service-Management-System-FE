import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "@/stores/auth/auth.types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,

      setSession: ({ accessToken, refreshToken, userId = null }) => {
        set({ accessToken, refreshToken, userId });
      },

      clearSession: () => {
        set({ accessToken: null, refreshToken: null, userId: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    },
  ),
);
