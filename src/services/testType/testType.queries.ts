import { useQuery } from "@tanstack/react-query";
import testTypeService, { type TestTypesResponse } from "./testTypeService";

// Query Keys
export const testTypeKeys = {
  all: ["test-types"],
  lists: () => [...testTypeKeys.all, "list"],
  details: () => [...testTypeKeys.all, "detail"],
  detail: (id: number) => [...testTypeKeys.details(), id],
};

/**
 * Hook to fetch all test types
 */
export const useTestTypesQuery = () => {
  return useQuery<TestTypesResponse>({
    queryKey: testTypeKeys.all,
    queryFn: () => testTypeService.getAllTestTypes(),
    staleTime: 1000 * 60 * 10, // 10 minutes (test types don't change often)
  });
};

/**
 * Hook to fetch single test type by ID
 */
export const useTestTypeDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: id ? testTypeKeys.detail(id) : ["test-type-detail-disabled"],
    queryFn: () => (id ? testTypeService.getTestTypeById(id) : Promise.reject("No ID")),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};