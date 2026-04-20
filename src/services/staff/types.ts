import type { ApiResponse, PageResponse } from "@/services/admin/types";

export interface StaffWorkFilters {
  page: number;
  size: number;
  sort: string;
  status?: string;
}

export interface StaffOrderRecord {
  id?: number | string;
  orderId?: number | string;
  orderCode?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface StaffTestResultRecord {
  id?: number | string;
  testResultId?: number | string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface StaffSampleCollectionRecord {
  id?: number | string;
  collectionId?: number | string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export type StaffOrdersResponse = ApiResponse<PageResponse<StaffOrderRecord>>;
export type StaffTestResultsResponse = ApiResponse<PageResponse<StaffTestResultRecord>>;
export type StaffSampleCollectionsResponse = ApiResponse<
  PageResponse<StaffSampleCollectionRecord>
>;
