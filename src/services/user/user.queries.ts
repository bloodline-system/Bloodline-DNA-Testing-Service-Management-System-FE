import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { userService } from "./userService";
import type {
  ApiResponse,
  ChangePasswordRequest,
  ResponseObject,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "./types";

export const userQueryKeys = {
  me: ["user", "me"] as const,
  profile: (username: string) => ["user", "profile", username] as const,
};

export const uploadQueryKeys = {
  images: ["upload", "images"] as const,
};

export function useFetchMe(enabled = true) {
  const query = useQuery<ApiResponse<UserProfileResponse>>({
    queryKey: userQueryKeys.me,
    queryFn: async () => {
      return await userService.getMyProfile();
    },
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(
        getApiErrorMessage(query.error, "Fetch information user error!"),
      );
    }
  }, [query.error]);

  return query;
}

export function useFetchProfileByUsername(username: string | undefined, enabled = true) {
  const query = useQuery<ApiResponse<UserProfileResponse>>({
    queryKey: userQueryKeys.profile(username ?? ""),
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      return await userService.getProfileByUsername(username);
    },
    enabled: enabled && Boolean(username),
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Fetch profile failed."));
    }
  }, [query.error]);

  return query;
}

export function useUpdateProfileMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserProfileRequest) => {
      return await userService.updateMyProfile(payload);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me });
      void queryClient.invalidateQueries({
        queryKey: userQueryKeys.profile(username),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update profile."));
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      return await userService.changePassword(payload);
    },
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to change password."));
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      return await userService.deleteProfile(username);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.me });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete account."));
    },
  });
}

export function useFetchAllImageUrls(enabled = true) {
  const query = useQuery<ResponseObject<string[]>>({
    queryKey: uploadQueryKeys.images,
    queryFn: async () => {
      return await userService.getAllImageUrls();
    },
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Fetch images failed."));
    }
  }, [query.error]);

  return query;
}

export function useUploadImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return await userService.uploadImage(file);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Upload image successfully.");
      void queryClient.invalidateQueries({ queryKey: uploadQueryKeys.images });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Upload image failed."));
    },
  });
}
