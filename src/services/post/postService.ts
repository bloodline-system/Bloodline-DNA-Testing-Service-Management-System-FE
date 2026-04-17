import api from "@/lib/axios";
import type {
  ApiResponse,
  ContentPostRequest,
  ContentPostResponse,
  PageResponse,
  PostFilters,
} from "./types";

export const postService = {
  getPosts: async (
    filters: PostFilters,
  ): Promise<ApiResponse<PageResponse<ContentPostResponse>>> => {
    const params = new URLSearchParams({
      q: filters.query,
      status: filters.status,
      category: filters.category,
      tag: filters.tag,
      page: String(filters.page),
      size: String(filters.size),
    });

    const response = await api.get<ApiResponse<PageResponse<ContentPostResponse>>>(
      `/v1/manager/posts?${params.toString()}`,
      { withCredentials: true },
    );

    return response.data;
  },

  getPostById: async (
    postId: number,
  ): Promise<ApiResponse<ContentPostResponse>> => {
    const response = await api.get<ApiResponse<ContentPostResponse>>(
      `/v1/manager/posts/${postId}`,
      { withCredentials: true },
    );

    return response.data;
  },

  createPost: async (
    payload: ContentPostRequest,
  ): Promise<ApiResponse<ContentPostResponse>> => {
    const response = await api.post<ApiResponse<ContentPostResponse>>(
      "/v1/manager/posts",
      payload,
      { withCredentials: true },
    );

    return response.data;
  },

  updatePost: async (
    postId: number,
    payload: ContentPostRequest,
  ): Promise<ApiResponse<ContentPostResponse>> => {
    const response = await api.put<ApiResponse<ContentPostResponse>>(
      `/v1/manager/posts/${postId}`,
      payload,
      { withCredentials: true },
    );

    return response.data;
  },

  updatePostStatus: async (
    postId: number,
    status: string,
  ): Promise<ApiResponse<ContentPostResponse>> => {
    const response = await api.patch<ApiResponse<ContentPostResponse>>(
      `/v1/manager/posts/${postId}/status`,
      null,
      {
        params: { status },
        withCredentials: true,
      },
    );

    return response.data;
  },

  deletePost: async (postId: number, hard = false): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/v1/manager/posts/${postId}`,
      {
        params: { hard },
        withCredentials: true,
      },
    );

    return response.data;
  },
};
