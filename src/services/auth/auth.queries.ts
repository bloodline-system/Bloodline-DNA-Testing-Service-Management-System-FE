import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { authService } from "@/services/auth/authService";
import type {
  LoginSessionData,
  LoginRequest,
  RefreshTokenRequest,
  ResendOtpRequest,
  SignUpRequest,
  VerifyOtpRequest,
  LogoutRequest,
} from "./types";

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (payload: SignUpRequest) => {
      const response = await authService.signUp(payload);
      return response.data["sign-up-id"];
    },
    onSuccess: () => {
      toast.success(
        "Sign up successfully! Please verify your account using the OTP sent to your email.",
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Sign up failed."));
    },
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async (payload: VerifyOtpRequest) => {
      const response = await authService.verifyOtp(payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("OTP verified successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "OTP verification failed."));
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: async (payload: ResendOtpRequest) => {
      const response = await authService.resendOtp(payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("OTP resent successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to resend OTP."));
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginRequest): Promise<LoginSessionData> => {
      const response = await authService.login(payload);
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        userId: response.data.user_id,
      };
    },
    onSuccess: () => {
      toast.success("Login successfully! Welcome!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to login."));
    },
  });
}

export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (
      payload: RefreshTokenRequest,
    ): Promise<LoginSessionData> => {
      const response = await authService.refreshToken(payload);
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        userId: response.data.user_id,
      };
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async (payload: LogoutRequest): Promise<void> => {
      await authService.logout(payload);
    },
    onSuccess: () => {
      toast.success("Logout successfully!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to logout."));
    },
  });
}
