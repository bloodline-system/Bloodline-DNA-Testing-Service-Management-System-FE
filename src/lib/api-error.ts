import { AxiosError } from "axios";

type ApiErrorPayload = {
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong.",
): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiErrorPayload | undefined)
      ?.message;
    return message ?? fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
