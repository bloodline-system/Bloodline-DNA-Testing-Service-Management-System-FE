import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reportService, { type ReportsResponse, type CreateReportPayload, type UpdateReportStatusPayload } from "./reportService";
import { toast } from "sonner";

// Query Keys
export const reportKeys = {
  all: ["reports"],
  lists: () => [...reportKeys.all, "list"],
  list: (filters: any) => [...reportKeys.lists(), filters],
  details: () => [...reportKeys.all, "detail"],
  detail: (id: number) => [...reportKeys.details(), id],
};

/**
 * Hook to fetch all reports with pagination and filters
 */
export const useReportsQuery = (
  page: number = 0,
  size: number = 20,
  status: string = "all",
  generatedByRole: string = "all",
  search: string = "",
  sortBy: string = "createdAt",
  sortDir: "asc" | "desc" = "desc"
) => {
  return useQuery<ReportsResponse>({
    queryKey: reportKeys.list({ page, size, status, generatedByRole, search, sortBy, sortDir }),
    queryFn: () =>
      reportService.getAllReports(page, size, status, generatedByRole, search, sortBy, sortDir),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch single report by ID
 */
export const useReportDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: id ? reportKeys.detail(id) : ["report-detail-disabled"],
    queryFn: () => (id ? reportService.getReportById(id) : Promise.reject("No ID")),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a new report
 */
export const useCreateReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportService.createReport(payload),
    onSuccess: () => {
      toast.success("Report created successfully");
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create report";
      toast.error(message);
    },
  });
};

/**
 * Hook to update report status
 */
export const useUpdateReportStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReportStatusPayload }) =>
      reportService.updateReportStatus(id, payload),
    onSuccess: (_data, { id }) => {
      toast.success("Report status updated successfully");
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update report status";
      toast.error(message);
    },
  });
};

/**
 * Hook to approve a report
 */
export const useApproveReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportService.approveReport(id),
    onSuccess: (_data, id) => {
      toast.success("Report approved successfully");
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to approve report";
      toast.error(message);
    },
  });
};

/**
 * Hook to reject a report
 */
export const useRejectReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportService.rejectReport(id),
    onSuccess: (_data, id) => {
      toast.success("Report rejected successfully");
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to reject report";
      toast.error(message);
    },
  });
};

/**
 * Hook to download report PDF
 */
export const useDownloadReportMutation = () => {
  return useMutation({
    mutationFn: (id: number) => reportService.downloadReport(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to download report";
      toast.error(message);
    },
  });
};
