import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { authService } from "@/services/auth/authService";
import type {
  ResendOtpRequest,
  SignUpRequest,
  VerifyOtpRequest,
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
