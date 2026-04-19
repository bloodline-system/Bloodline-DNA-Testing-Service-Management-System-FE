export interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface PageResponse<TData> {
  content: TData[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const SERVICE_CATEGORIES = ["CIVIL", "ADMINISTRATIVE"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface ServiceFeatureAssignmentRequest {
  featureName: string;
  isAvailable: boolean;
}

export interface ServiceFeatureAssignmentResponse {
  featureId: number;
  featureName: string;
  isAvailable: boolean;
}

export interface MedicalServiceRequest {
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceTypeId: number;
  participants: number;
  executionTimeDays: number;
  basePrice: number;
  currentPrice: number;
  isAvailable: boolean;
  serviceDescription: string;
  featureAssignments: ServiceFeatureAssignmentRequest[];
}

export interface MedicalServiceUpdateRequest {
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceTypeId: number;
  participants: number;
  executionTimeDays: number;
  basePrice: number;
  currentPrice: number;
  isAvailable: boolean;
  serviceDescription: string;
  editFeatureAssignments: ServiceFeatureAssignmentRequest[];
}

export interface MedicalServiceResponse {
  id: number;
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceTypeId: number;
  serviceTypeName: string;
  participants: number;
  executionTimeDays: number;
  basePrice: number;
  currentPrice: number;
  isAvailable: boolean;
  serviceDescription: string;
  createdAt: string;
  updatedAt: string;
  features: ServiceFeatureAssignmentResponse[];
}

export interface MedicalServiceFilterResponse {
  id: number;
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceTypeName: string;
  participants: number;
  currentPrice: number;
  isAvailable: boolean;
  serviceDescription: string;
}

export interface ServiceTypeRequest {
  typeName: string;
  isActive?: boolean;
}

export interface ServiceTypeResponse {
  id: number;
  typeName: string;
  isActive: boolean;
}

export interface PageQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}
