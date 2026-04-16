import api from "@/lib/axios";
import type {
  ApiResponse,
  ResponseObject,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "./types";

export const userService = {
  getMyProfile: async (): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await api.get<ApiResponse<UserProfileResponse>>(
      "/v1/profiles/me",
      {
        withCredentials: true,
      },
    );

    return response.data;
  },

  getProfileByUsername: async (
    username: string,
  ): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await api.get<ApiResponse<UserProfileResponse>>(
      `/v1/profiles/${encodeURIComponent(username)}`,
      {
        withCredentials: true,
      },
    );

    return response.data;
  },

  updateProfile: async (
    username: string,
    payload: UpdateUserProfileRequest | FormData,
  ): Promise<ApiResponse<UserProfileResponse>> => {
    const response = await api.put<ApiResponse<UserProfileResponse>>(
      `/v1/profiles/${encodeURIComponent(username)}`,
      payload,
      {
        withCredentials: true,
      },
    );

    return response.data;
  },

  deleteProfile: async (username: string): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/v1/profiles/${encodeURIComponent(username)}`,
      {
        withCredentials: true,
      },
    );

    return response.data;
  },

  uploadImage: async (file: File): Promise<ResponseObject<string>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ResponseObject<string>>(
      "/upload/img",
      formData,
      {
        withCredentials: true,
      },
    );

    if (response.data.status !== "ok") {
      throw new Error(response.data.message || "Upload image failed.");
    }

    return response.data;
  },

  getAllImageUrls: async (): Promise<ResponseObject<string[]>> => {
    const response = await api.get<ResponseObject<string[]>>("/upload", {
      withCredentials: true,
    });

    if (response.data.status !== "ok") {
      throw new Error(response.data.message || "Fetch images failed.");
    }

    return response.data;
  },

  buildUploadedImageUrl: (fileName: string): string =>
    `/api/upload/files/${encodeURIComponent(fileName)}`,
};
