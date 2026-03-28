import api from "@/lib/axios";
import type {
  ApiResponse,
  ResendOtpRequest,
  SignUpRequest,
  SignUpResponseData,
  VerifyOtpRequest,
} from "./types";

export const authService = {
  signUp: async (
    payload: SignUpRequest,
  ): Promise<ApiResponse<SignUpResponseData>> => {
    const response = await api.post<ApiResponse<SignUpResponseData>>(
      "/v1/auth/sign-up",
      payload,
      { withCredentials: true },
    );

    return response.data;
  },

  verifyOtp: async (
    payload: VerifyOtpRequest,
  ): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(
      "/v1/auth/verification",
      payload,
      { withCredentials: true },
    );

    return response.data;
  },

  resendOtp: async (
    payload: ResendOtpRequest,
  ): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(
      "/v1/auth/resend-otp",
      null,
      {
        params: { signUpId: payload.signUpId },
        withCredentials: true,
      },
    );

    return response.data;
  },
};
