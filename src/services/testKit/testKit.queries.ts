import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testKitService } from "./testKitService";
import type { TestKitRequest } from "./types";

export const useTestKits = (page = 0, size = 10, enabled = true) => {
  return useQuery({
    queryKey: ["testKits", page, size],
    queryFn: () => testKitService.getAllTestKits(page, size),
    enabled,
  });
};

export const useTestKit = (id: number) => {
  return useQuery({
    queryKey: ["testKit", id],
    queryFn: () => testKitService.getTestKitById(id),
    enabled: !!id,
  });
};

export const useSearchTestKits = (query: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ["searchTestKits", query, page, size],
    queryFn: () => testKitService.searchTestKits(query, page, size),
    enabled: !!query,
  });
};

export const useCreateTestKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testKitService.createTestKit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testKits"] });
    },
  });
};

export const useUpdateTestKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestKitRequest }) =>
      testKitService.updateTestKit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testKits"] });
      queryClient.invalidateQueries({ queryKey: ["testKit"] });
    },
  });
};

export const useDeleteTestKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testKitService.deleteTestKit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testKits"] });
    },
  });
};
