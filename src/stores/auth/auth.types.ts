export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;

  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    userId?: string | null;
  }) => void;
  clearSession: () => void;
}
