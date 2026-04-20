import api from "@/lib/axios";
import type { AdminDashboardStatsPayload, ApiResponse, DashboardStats, RecentActivity } from "./types";

function flattenDashboardStatsPayload(raw: AdminDashboardStatsPayload): DashboardStats {
  const dashboard = raw.dashboard;
  if (dashboard && typeof dashboard === "object") {
    return { ...raw, ...dashboard };
  }
  return raw as DashboardStats;
}

export const adminDashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get<ApiResponse<AdminDashboardStatsPayload>>("/v1/admin/dashboard/stats", {
      withCredentials: true,
    });
    const body = response.data;
    return {
      ...body,
      data: flattenDashboardStatsPayload(body.data),
    };
  },

  async getRecentActivities(): Promise<ApiResponse<RecentActivity[]>> {
    const response = await api.get<ApiResponse<RecentActivity[]>>("/v1/admin/dashboard/recent-activities", {
      withCredentials: true,
    });
    return response.data;
  },
};
