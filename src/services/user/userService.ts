import api from "@/lib/axios";
import type { ApiResponse, UserProfileResponse } from "../user/types";

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
};
