import type { ApiResponse, LoginResponseData } from "@/services/auth/types";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const REFRESH_SKEW_MS = 30_000;

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const base64Url = parts[1] ?? "";
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getJwtExpMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;

  if (typeof exp === "number" && Number.isFinite(exp)) {
    return exp * 1000;
  }

  if (typeof exp === "string") {
    const expNum = Number(exp);
    if (Number.isFinite(expNum)) {
      return expNum * 1000;
    }
  }

  return null;
};

const requestTokenRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken, setSession, clearSession } =
        useAuthStore.getState();

      if (!refreshToken) {
        console.log("No refresh token available");
        clearSession();
        throw new Error("Missing refresh token.");
      }

      console.log("Attempting to refresh token");
      try {
        const response = await refreshClient.post<
          ApiResponse<LoginResponseData>
        >("/v1/auth/refresh-token", { refreshToken });
        const data = response.data.data;

        console.log("Refresh response received");
        setSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          userId: data.user_id,
        });

        return data.access_token;
      } catch (error) {
        console.log("Refresh request failed:", error);
        clearSession();
        throw error;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

api.interceptors.request.use(async (config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    console.log("No access token available");
    return config;
  }

  let tokenToUse = accessToken;
  const expMs = getJwtExpMs(accessToken);

  if (expMs != null && expMs - Date.now() < REFRESH_SKEW_MS) {
    console.log("Token expiring soon, refreshing...");
    tokenToUse = await requestTokenRefresh();
    console.log("Token refreshed successfully");
  }

  config.headers = config.headers ?? {};
  (config.headers as Record<string, unknown>).Authorization =
    `Bearer ${tokenToUse}`;

  console.log("Request with auth header:", config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401
    ) {
      console.log(
        "Response error (not 401 or already retried):",
        error.response?.status,
      );
      return Promise.reject(error);
    }

    console.log("401 error detected, attempting token refresh");
    originalRequest._retry = true;

    try {
      const newAccessToken = await requestTokenRefresh();
      console.log("Refresh successful, retrying request");
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      console.log("Refresh failed, clearing session:", refreshError);
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
