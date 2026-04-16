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

const requestTokenRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken, setSession, clearSession } =
        useAuthStore.getState();

      if (!refreshToken) {
        clearSession();
        throw new Error("Missing refresh token.");
      }

      const response = await refreshClient.post<ApiResponse<LoginResponseData>>(
        "/v1/auth/refresh-token",
        { refreshToken },
      );
      const data = response.data.data;

      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userId: data.user_id,
      });

      return data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

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
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await requestTokenRefresh();
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
