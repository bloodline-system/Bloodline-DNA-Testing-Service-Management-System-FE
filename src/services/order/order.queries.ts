import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderService, {
  type OrdersResponse,
  type NewOrdersResponse,
  type CustomerOrderCreateRequest,
} from "./orderService";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth/useAuthStore";

// Query Keys
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, "detail"],
  detail: (id: number) => [...orderKeys.details(), id],
  new: () => [...orderKeys.all, "new"],
};

/**
 * Hook to fetch all orders
 */
export const useOrdersQuery = () => {
  return useQuery<OrdersResponse>({
    queryKey: orderKeys.all,
    queryFn: () => orderService.getAllOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch new orders
 */
export const useNewOrdersQuery = () => {
  return useQuery<NewOrdersResponse>({
    queryKey: orderKeys.new(),
    queryFn: () => orderService.getNewOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch single order by ID
 */
export const useOrderDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: id ? orderKeys.detail(id) : ["order-detail-disabled"],
    queryFn: () =>
      id ? orderService.getOrderById(id) : Promise.reject("No ID"),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch single order details by customer
 * Uses the customer order endpoint from the new API.
 */
export const useOrderDetailByCustomerQuery = (id: number | null) => {
  return useQuery({
    queryKey: id
      ? ["order-detail-customer", id]
      : ["order-detail-customer-disabled"],
    queryFn: () =>
      id ? orderService.getOrderDetailsByCustomer(id) : Promise.reject("No ID"),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCustomerServicesQuery = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["customer-services"],
    queryFn: () => orderService.getCustomerServices(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomerOrderFormDataQuery = (
  medicalServiceId: number | null,
) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: medicalServiceId
      ? ["customer-order-form-data", medicalServiceId]
      : ["customer-order-form-data-disabled"],
    queryFn: () =>
      medicalServiceId
        ? orderService.getCustomerOrderFormData(medicalServiceId)
        : Promise.reject("No medical service id"),
    enabled: !!accessToken && !!medicalServiceId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomerOrdersQuery = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<{
    code: number;
    data: Array<{
      idServiceOrder: number;
      orderStatus: string;
      medicalServiceName?: string;
      finalAmount?: number;
      appointmentDate?: string;
    }>;
    message: string;
    timestamp: string;
  }>({
    queryKey: ["customer-orders"],
    queryFn: () => orderService.getCustomerOrders(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to assign collection staff to an order
 */
export const useAssignCollectionStaffMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, staffId }: { orderId: number; staffId: number }) =>
      orderService.assignCollectionStaff(orderId, staffId),
    onSuccess: (_data, { orderId }) => {
      toast.success("Collection staff assigned successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error: AxiosError) => {
      const message =
        (error?.response?.data as Record<string, unknown>)?.message ||
        "Failed to assign collection staff";
      toast.error(message as string);
    },
  });
};

/**
 * Hook to assign analysis staff to an order
 */
export const useAssignAnalysisStaffMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, staffId }: { orderId: number; staffId: number }) =>
      orderService.assignAnalysisStaff(orderId, staffId),
    onSuccess: (_data, { orderId }) => {
      toast.success("Analysis staff assigned successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error: AxiosError) => {
      const message =
        (error?.response?.data as Record<string, unknown>)?.message ||
        "Failed to assign analysis staff";
      toast.error(message as string);
    },
  });
};

/**
 * Hook to update order status
 */
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (_data, { orderId }) => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error: AxiosError) => {
      const message =
        (error?.response?.data as Record<string, unknown>)?.message ||
        "Failed to update order status";
      toast.error(message as string);
    },
  });
};

/**
 * Hook to create a new order
 */
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: {
      testTypeId: number;
      customerName: string;
      email: string;
      phone: string;
      address: string;
    }) => orderService.createOrder(orderData),
    onSuccess: () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create order";
      toast.error(message);
    },
  });
};

export const useCreateCustomerOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CustomerOrderCreateRequest) => {
      const createdOrder = await orderService.createCustomerOrder(orderData);
      const createdOrderId = createdOrder?.data?.idServiceOrder;

      if (!createdOrderId) {
        return createdOrder;
      }

      try {
        const participantRequests = orderData.participants ?? [];
        if (participantRequests.length > 0) {
          for (const participant of participantRequests) {
            await orderService.addCustomerOrderParticipant(
              createdOrderId,
              participant,
            );
          }
        }

        if (orderData.idKit && Number(orderData.quantityKit ?? 0) > 0) {
          await orderService.addCustomerOrderKit(createdOrderId, {
            kitTestId: Number(orderData.idKit),
            quantityOrdered: Number(orderData.quantityKit),
          });
        }
      } catch (error) {
        const message =
          (error as AxiosError<{ message?: string }>)?.response?.data
            ?.message ||
          (error as Error)?.message ||
          "Không thể lưu participants hoặc test kit cho đơn hàng";
        throw new Error(
          `Đơn hàng đã được tạo nhưng không thể lưu participants/test kit: ${message}`,
        );
      }

      return createdOrder;
    },
    onSuccess: (_data) => {
      toast.success("Đã tạo đơn hàng thành công");
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-services"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo đơn hàng";
      toast.error(message);
    },
  });
};

export const useAcceptCustomerOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderService.acceptCustomerOrder(orderId),
    onSuccess: (_data, orderId) => {
      toast.success("Đã xác nhận đơn hàng");
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({
        queryKey: ["order-detail-customer", orderId],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Không thể xác nhận đơn hàng";
      toast.error(message);
    },
  });
};

export const useCancelCustomerOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderService.cancelCustomerOrder(orderId),
    onSuccess: (_data, orderId) => {
      toast.success("Đã hủy đơn hàng");
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({
        queryKey: ["order-detail-customer", orderId],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Không thể hủy đơn hàng";
      toast.error(message);
    },
  });
};
