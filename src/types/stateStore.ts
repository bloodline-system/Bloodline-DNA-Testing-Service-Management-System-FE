export interface AuthState {
  accessToken: string | null;
  userId: string | null;

  setSession: (session: {
    accessToken: string;
    userId?: string | null;
  }) => void;
  clearSession: () => void;
}
