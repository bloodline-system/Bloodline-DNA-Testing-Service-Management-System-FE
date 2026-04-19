import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { staffWorkService } from "./staffWorkService";
import type { StaffWorkFilters } from "./types";

export const staffWorkQueryKeys = {
  orders: (filters: StaffWorkFilters) => ["staff", "work", "orders", filters] as const,
  testResults: (filters: StaffWorkFilters) => ["staff", "work", "test-results", filters] as const,
  sampleCollections: (filters: StaffWorkFilters) =>
    ["staff", "work", "sample-collections", filters] as const,
};

export function useStaffOrdersQuery(filters: StaffWorkFilters, enabled = true) {
  const query = useQuery({
    queryKey: staffWorkQueryKeys.orders(filters),
    queryFn: async () => staffWorkService.getOrders(filters),
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Unable to load staff orders."));
    }
  }, [query.error]);

  return query;
}

export function useStaffTestResultsQuery(filters: StaffWorkFilters, enabled = true) {
  const query = useQuery({
    queryKey: staffWorkQueryKeys.testResults(filters),
    queryFn: async () => staffWorkService.getTestResults(filters),
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Unable to load test results."));
    }
  }, [query.error]);

  return query;
}

export function useStaffSampleCollectionsQuery(filters: StaffWorkFilters, enabled = true) {
  const query = useQuery({
    queryKey: staffWorkQueryKeys.sampleCollections(filters),
    queryFn: async () => staffWorkService.getSampleCollections(filters),
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(getApiErrorMessage(query.error, "Unable to load sample collections."));
    }
  }, [query.error]);

  return query;
}
