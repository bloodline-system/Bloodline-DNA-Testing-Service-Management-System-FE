import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { adminUserService } from "./adminUserService";
import type {
  EmployeeId,
  EmployeeUserFilters,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeUserRequest,
} from "./types";

export const adminUserQueryKeys = {
  users: (filters: EmployeeUserFilters) => ["admin", "users", filters] as const,
  userDetail: (id: EmployeeId) => ["admin", "users", "detail", id] as const,
  profiles: ["admin", "profiles"] as const,
  profileByUsername: (username: string) => ["admin", "profiles", username] as const,
};

export function useAdminUsersQuery(filters: EmployeeUserFilters) {
  return useQuery({
    queryKey: adminUserQueryKeys.users(filters),
    queryFn: async () => adminUserService.getUsers(filters),
    retry: false,
  });
}

export function useAdminUserDetailsQuery(userId: EmployeeId | null) {
  return useQuery({
    queryKey: userId != null ? adminUserQueryKeys.userDetail(userId) : ["admin", "users", "detail", "none"],
    queryFn: async () => {
      if (userId == null) {
        throw new Error("User id is required.");
      }
      return adminUserService.getUserById(userId);
    },
    enabled: userId != null,
    retry: false,
  });
}

export function useAdminProfilesQuery(enabled = true) {
  return useQuery({
    queryKey: adminUserQueryKeys.profiles,
    queryFn: async () => adminUserService.getAllProfiles(),
    retry: false,
    enabled,
  });
}

export function useAdminProfileByUsernameQuery(username: string | null, enabled = true) {
  return useQuery({
    queryKey: username ? adminUserQueryKeys.profileByUsername(username) : ["admin", "profiles", "none"],
    queryFn: async () => {
      if (!username) {
        throw new Error("Username is required.");
      }
      return adminUserService.getProfileByUsername(username);
    },
    enabled: Boolean(username) && enabled,
    retry: false,
  });
}

export function useAdminUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: EmployeeId; data: UpdateEmployeeUserRequest }) =>
      adminUserService.updateUser(payload.id, payload.data),
    onSuccess: (_, variables) => {
      toast.success("Employee account updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({
        queryKey: adminUserQueryKeys.userDetail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.profiles });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update employee account."));
    },
  });
}

export function useAdminUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { username: string; data: UpdateEmployeeProfileRequest }) =>
      adminUserService.updateProfile(payload.username, payload.data),
    onSuccess: (_, variables) => {
      toast.success("Employee profile updated.");
      void queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.profiles });
      void queryClient.invalidateQueries({
        queryKey: adminUserQueryKeys.profileByUsername(variables.username),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update employee profile."));
    },
  });
}

export function useAdminDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => adminUserService.deleteProfile(username),
    onSuccess: () => {
      toast.success("Employee profile deleted.");
      void queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.profiles });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete employee profile."));
    },
  });
}
