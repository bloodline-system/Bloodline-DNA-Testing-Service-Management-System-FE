import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { medicalServiceService } from "./medicalServiceService";
import type {
  MedicalServiceRequest,
  MedicalServiceUpdateRequest,
  PageQueryParams,
  ServiceTypeRequest,
} from "./types";

export const medicalServiceKeys = {
  all: ["medical-services"] as const,
  list: (params?: PageQueryParams) =>
    [...medicalServiceKeys.all, "list", params] as const,
  detail: (id: number) => [...medicalServiceKeys.all, "detail", id] as const,
  search: (query: string, params?: PageQueryParams) =>
    [...medicalServiceKeys.all, "search", query, params] as const,
  serviceTypes: ["service-types"] as const,
  serviceTypesList: (params?: PageQueryParams) =>
    [...medicalServiceKeys.serviceTypes, "list", params] as const,
  serviceTypeDetail: (id: number) =>
    [...medicalServiceKeys.serviceTypes, "detail", id] as const,
};

export const useMedicalServicesPageQuery = (params?: PageQueryParams) =>
  useQuery({
    queryKey: medicalServiceKeys.list(params),
    queryFn: () => medicalServiceService.getServicesPage(params),
  });

export const useMedicalServiceByIdQuery = (id: number | null) =>
  useQuery({
    queryKey: id ? medicalServiceKeys.detail(id) : ["medical-service-idle"],
    queryFn: () =>
      id != null
        ? medicalServiceService.getServiceById(id)
        : Promise.reject(new Error("Service id is required")),
    enabled: id != null,
  });

export const useSearchMedicalServicesQuery = (
  query: string,
  params?: PageQueryParams,
) =>
  useQuery({
    queryKey: medicalServiceKeys.search(query, params),
    queryFn: () => medicalServiceService.searchServicesPage(query, params),
    enabled: query.trim().length > 0,
  });

export const useCreateMedicalServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MedicalServiceRequest) =>
      medicalServiceService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalServiceKeys.all });
    },
  });
};

export const useUpdateMedicalServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: MedicalServiceUpdateRequest;
    }) => medicalServiceService.updateService(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: medicalServiceKeys.all });
      queryClient.invalidateQueries({
        queryKey: medicalServiceKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteMedicalServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => medicalServiceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalServiceKeys.all });
    },
  });
};

export const useServiceTypesPageQuery = (params?: PageQueryParams) =>
  useQuery({
    queryKey: medicalServiceKeys.serviceTypesList(params),
    queryFn: () => medicalServiceService.getServiceTypesPage(params),
  });

export const useServiceTypeByIdQuery = (id: number | null) =>
  useQuery({
    queryKey: id
      ? medicalServiceKeys.serviceTypeDetail(id)
      : ["service-type-idle"],
    queryFn: () =>
      id != null
        ? medicalServiceService.getServiceTypeById(id)
        : Promise.reject(new Error("Service type id is required")),
    enabled: id != null,
  });

export const useCreateServiceTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceTypeRequest) =>
      medicalServiceService.createServiceType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalServiceKeys.serviceTypes,
      });
    },
  });
};

export const useUpdateServiceTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ServiceTypeRequest;
    }) => medicalServiceService.updateServiceType(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalServiceKeys.serviceTypes,
      });
      queryClient.invalidateQueries({
        queryKey: medicalServiceKeys.serviceTypeDetail(variables.id),
      });
    },
  });
};

export const useDeleteServiceTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => medicalServiceService.deleteServiceType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalServiceKeys.serviceTypes,
      });
    },
  });
};
