import api from "@/lib/axios";
import type {
  StaffOrdersResponse,
  StaffSampleCollectionsResponse,
  StaffTestResultsResponse,
  StaffWorkFilters,
} from "./types";

const toParams = (filters: StaffWorkFilters) => {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.size),
    sort: filters.sort,
  });

  if (filters.status) {
    params.set("status", filters.status);
  }

  return params.toString();
};

export const staffWorkService = {
  async getOrders(filters: StaffWorkFilters): Promise<StaffOrdersResponse> {
    const response = await api.get<StaffOrdersResponse>(`/v1/staff/orders?${toParams(filters)}`, {
      withCredentials: true,
    });
    return response.data;
  },

  async getTestResults(filters: StaffWorkFilters): Promise<StaffTestResultsResponse> {
    const response = await api.get<StaffTestResultsResponse>(`/v1/staff/test-results?${toParams(filters)}`, {
      withCredentials: true,
    });
    return response.data;
  },

  async getSampleCollections(filters: StaffWorkFilters): Promise<StaffSampleCollectionsResponse> {
    const response = await api.get<StaffSampleCollectionsResponse>(
      `/v1/staff/sample-collections?${toParams(filters)}`,
      { withCredentials: true },
    );
    return response.data;
  },
};
