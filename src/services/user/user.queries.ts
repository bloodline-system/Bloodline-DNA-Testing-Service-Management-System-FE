import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { userService } from "./userService";
import type { UserProfileResponse, ApiResponse } from "./types";

export const userQueryKeys = {
  me: ["user", "me"] as const,
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
