import { create } from "zustand";
import type { AuthState } from "@/types/stateStore";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,

  setSession: ({ accessToken, userId = null }) => {
    set({ accessToken, userId });
  },

  clearSession: () => {
    set({ accessToken: null, userId: null });
  },
}));
