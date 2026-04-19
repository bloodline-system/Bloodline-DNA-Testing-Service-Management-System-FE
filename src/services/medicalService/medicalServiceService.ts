import api from "@/lib/axios";
import type {
  ApiResponse,
  MedicalServiceFilterResponse,
  MedicalServiceRequest,
  MedicalServiceResponse,
  MedicalServiceUpdateRequest,
  PageQueryParams,
  PageResponse,
  ServiceTypeRequest,
  ServiceTypeResponse,
} from "./types";

const MEDICAL_SERVICES_BASE = "/v1/manager/services";
const SERVICE_TYPES_BASE = "/v1/manager/service-types";

const toPageParams = (params?: PageQueryParams) => ({
  page: params?.page ?? 0,
  size: params?.size ?? 10,
  sort: params?.sort ?? "id",
});

export const medicalServiceService = {
  getServicesPage: async (
    params?: PageQueryParams,
  ): Promise<PageResponse<MedicalServiceResponse>> => {
    const response = await api.get<
      ApiResponse<PageResponse<MedicalServiceResponse>>
    >(MEDICAL_SERVICES_BASE, { params: toPageParams(params) });
    return response.data.data;
  },

  getServiceById: async (id: number): Promise<MedicalServiceResponse> => {
    const response = await api.get<ApiResponse<MedicalServiceResponse>>(
      `${MEDICAL_SERVICES_BASE}/${id}`,
    );
    return response.data.data;
  },

  createService: async (
    payload: MedicalServiceRequest,
  ): Promise<MedicalServiceResponse> => {
    const response = await api.post<ApiResponse<MedicalServiceResponse>>(
      MEDICAL_SERVICES_BASE,
      payload,
    );
    return response.data.data;
  },

  updateService: async (
    id: number,
    payload: MedicalServiceUpdateRequest,
  ): Promise<void> => {
    await api.put<ApiResponse<void>>(`${MEDICAL_SERVICES_BASE}/${id}`, payload);
  },

  deleteService: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`${MEDICAL_SERVICES_BASE}/${id}`);
  },

  searchServicesPage: async (
    query: string,
    params?: PageQueryParams,
  ): Promise<PageResponse<MedicalServiceFilterResponse>> => {
    const response = await api.get<
      ApiResponse<PageResponse<MedicalServiceFilterResponse>>
    >(`${MEDICAL_SERVICES_BASE}/search`, {
      params: {
        query,
        ...toPageParams(params),
      },
    });
    return response.data.data;
  },

  getServiceTypesPage: async (
    params?: PageQueryParams,
  ): Promise<PageResponse<ServiceTypeResponse>> => {
    const response = await api.get<
      ApiResponse<PageResponse<ServiceTypeResponse>>
    >(SERVICE_TYPES_BASE, { params: toPageParams(params) });
    return response.data.data;
  },

  getServiceTypeById: async (id: number): Promise<ServiceTypeResponse> => {
    const response = await api.get<ApiResponse<ServiceTypeResponse>>(
      `${SERVICE_TYPES_BASE}/${id}`,
    );
    return response.data.data;
  },

  createServiceType: async (
    payload: ServiceTypeRequest,
  ): Promise<ServiceTypeResponse> => {
    const response = await api.post<ApiResponse<ServiceTypeResponse>>(
      SERVICE_TYPES_BASE,
      payload,
    );
    return response.data.data;
  },

  updateServiceType: async (
    id: number,
    payload: ServiceTypeRequest,
  ): Promise<void> => {
    await api.put<ApiResponse<void>>(`${SERVICE_TYPES_BASE}/${id}`, payload);
  },

  deleteServiceType: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`${SERVICE_TYPES_BASE}/${id}`);
  },
};
