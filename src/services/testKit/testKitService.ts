import axios from "@/lib/axios";
import type {
  ApiResponse,
  PageResponse,
  TestKit,
  TestKitRequest,
} from "./types";

export const testKitService = {
  getAllTestKits: async (
    page = 0,
    size = 10,
  ): Promise<PageResponse<TestKit>> => {
    const response = await axios.get<ApiResponse<PageResponse<TestKit>>>(
      "/v1/test-kits",
      {
        params: { page, size },
      },
    );
    return response.data.data;
  },

  getTestKitById: async (id: number): Promise<TestKit> => {
    const response = await axios.get<ApiResponse<TestKit>>(
      `/v1/test-kits/${id}`,
    );
    return response.data.data;
  },

  createTestKit: async (data: TestKitRequest): Promise<void> => {
    await axios.post("/v1/test-kits", data);
  },

  updateTestKit: async (id: number, data: TestKitRequest): Promise<void> => {
    await axios.put(`/v1/test-kits/${id}`, data);
  },

  deleteTestKit: async (id: number): Promise<void> => {
    await axios.delete(`/v1/test-kits/${id}`);
  },

  searchTestKits: async (
    query: string,
    page = 0,
    size = 10,
  ): Promise<PageResponse<TestKit>> => {
    const response = await axios.get<ApiResponse<PageResponse<TestKit>>>(
      "/v1/test-kits/search",
      {
        params: { query, page, size },
      },
    );
    return response.data.data;
  },
};
