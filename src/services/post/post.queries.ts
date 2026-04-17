import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { postService } from "./postService";
import type { ContentPostRequest, PostFilters } from "./types";

export const postQueryKeys = {
  list: (filters: PostFilters) => ["posts", "manager", "list", filters] as const,
  details: (postId: number) => ["posts", "manager", postId] as const,
};

export function usePostsQuery(filters: PostFilters) {
  return useQuery({
    queryKey: postQueryKeys.list(filters),
    queryFn: async () => postService.getPosts(filters),
    retry: false,
  });
}

export function usePostQuery(postId: number | null) {
  return useQuery({
    queryKey: postId != null ? postQueryKeys.details(postId) : ["posts", "manager", "details", "none"],
    queryFn: async () => {
      if (postId == null) throw new Error("Post id is required");
      return postService.getPostById(postId);
    },
    enabled: postId != null,
    retry: false,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ContentPostRequest) => postService.createPost(payload),
    onSuccess: () => {
      toast.success("Post created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["posts", "manager", "list"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create post."));
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { postId: number; data: ContentPostRequest }) =>
      postService.updatePost(payload.postId, payload.data),
    onSuccess: (_, variables) => {
      toast.success("Post updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["posts", "manager", "list"] });
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.details(variables.postId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update post."));
    },
  });
}

export function useUpdatePostStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { postId: number; status: string }) =>
      postService.updatePostStatus(payload.postId, payload.status),
    onSuccess: (_, variables) => {
      toast.success("Post status updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["posts", "manager", "list"] });
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.details(variables.postId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update post status."));
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { postId: number; hard?: boolean }) =>
      postService.deletePost(payload.postId, payload.hard ?? false),
    onSuccess: () => {
      toast.success("Post deleted successfully.");
      void queryClient.invalidateQueries({ queryKey: ["posts", "manager", "list"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete post."));
    },
  });
}
