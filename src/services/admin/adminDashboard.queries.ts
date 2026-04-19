import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { adminDashboardService } from "./adminDashboardService";

export const adminDashboardQueryKeys = {
  stats: ["admin", "dashboard", "stats"] as const,
  recentActivities: ["admin", "dashboard", "recent-activities"] as const,
};

export function useAdminDashboardStatsQuery(enabled = true) {
  const query = useQuery({
    queryKey: adminDashboardQueryKeys.stats,
    queryFn: async () => adminDashboardService.getStats(),
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Unable to load dashboard stats."));
    }
  }, [query.error]);

  return query;
}

export function useAdminRecentActivitiesQuery(enabled = true) {
  const query = useQuery({
    queryKey: adminDashboardQueryKeys.recentActivities,
    queryFn: async () => adminDashboardService.getRecentActivities(),
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Unable to load recent activities."));
    }
  }, [query.error]);

  return query;
}
