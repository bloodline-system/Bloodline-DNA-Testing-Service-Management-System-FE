import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderService, { type OrdersResponse, type NewOrdersResponse } from "./orderService";
import { toast } from "sonner";

// Query Keys
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (filters: any) => [...orderKeys.lists(), filters],
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
    queryFn: () => (id ? orderService.getOrderById(id) : Promise.reject("No ID")),
    enabled: !!id,
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
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to assign collection staff";
      toast.error(message);
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
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to assign analysis staff";
      toast.error(message);
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
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update order status";
      toast.error(message);
    },
  });
};
