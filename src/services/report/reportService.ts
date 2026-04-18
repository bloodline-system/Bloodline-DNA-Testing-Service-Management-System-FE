import axios from "@/lib/axios";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

export interface Report {
  id: number;
  reportStatus: string;
  generatedByRole?: string;
  testType?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  filePath?: string;
  result?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface ReportsResponse {
  code: number;
  data: {
    content: Report[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}

export interface CreateReportPayload {
  testType?: string;
  result?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface UpdateReportStatusPayload {
  status: string;
  reason?: string;
}

class ReportService {
  /**
   * Get all reports with pagination and filtering
   */
  async getAllReports(
    page: number = 0,
    size: number = 20,
    status: string = "all",
    generatedByRole: string = "all",
    search: string = "",
    sortBy: string = "createdAt",
    sortDir: "asc" | "desc" = "desc",
  ): Promise<ReportsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      status,
      generatedByRole,
      search,
      sortBy,
      sortDir,
    });

    const response = await axios.get(`/api/v1/manager/reports?${params}`);
    return response.data as ReportsResponse;
  }

  /**
   * Get single report by ID
   */
  async getReportById(id: number): Promise<ApiResponse<Report>> {
    const response = await axios.get(`/api/v1/manager/reports/${id}`);
    return response.data as ApiResponse<Report>;
  }

  /**
   * Create a new report
   */
  async createReport(
    payload: CreateReportPayload,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post("/api/v1/manager/reports", payload);
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Update report status (PENDING -> APPROVED/REJECTED)
   */
  async updateReportStatus(
    id: number,
    payload: UpdateReportStatusPayload,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.put(
      `/api/v1/manager/reports/${id}/status`,
      payload,
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Download report PDF
   */
  async downloadReport(id: number): Promise<Blob> {
    const response = await axios.get(`/api/v1/manager/reports/${id}/download`, {
      responseType: "blob",
    });
    return response.data as Blob;
  }

  /**
   * Approve report
   */
  async approveReport(
    id: number,
    reason?: string,
  ): Promise<ApiResponse<unknown>> {
    return this.updateReportStatus(id, {
      status: "APPROVED",
      reason,
    });
  }

  /**
   * Reject report
   */
  async rejectReport(
    id: number,
    reason?: string,
  ): Promise<ApiResponse<unknown>> {
    return this.updateReportStatus(id, {
      status: "REJECTED",
      reason,
    });
  }
}

export default new ReportService();
