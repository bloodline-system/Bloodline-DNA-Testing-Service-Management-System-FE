export type CustomerOrderItem = {
  idServiceOrder: number;
  orderStatus: string;
  medicalServiceName?: string;
  finalAmount?: number;
  appointmentDate?: string;
  [key: string]: unknown;
};

export type CustomerOrdersStats = {
  totalOrders: number;
  pendingCount: number;
  completedCount: number;
  totalValue: number;
};

export const filterCustomerOrders = (
  orders: CustomerOrderItem[],
  searchTerm: string,
  selectedStatus: string,
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return orders.filter((order) => {
    const matchStatus =
      selectedStatus === "all" || order.orderStatus === selectedStatus;

    const matchSearch =
      !normalizedSearch ||
      order.idServiceOrder.toString().includes(normalizedSearch) ||
      order.medicalServiceName?.toLowerCase().includes(normalizedSearch);

    return matchStatus && matchSearch;
  });
};

export const paginateCustomerOrders = (
  orders: CustomerOrderItem[],
  currentPage: number,
  itemsPerPage: number,
) => {
  const totalPages = Math.max(Math.ceil(orders.length / itemsPerPage), 1);
  const startIndex = currentPage * itemsPerPage;

  return {
    paginatedOrders: orders.slice(startIndex, startIndex + itemsPerPage),
    totalPages,
  };
};

export const getCustomerOrderStats = (
  orders: CustomerOrderItem[],
): CustomerOrdersStats => ({
  totalOrders: orders.length,
  pendingCount: orders.filter((order) => order.orderStatus === "PENDING")
    .length,
  completedCount: orders.filter((order) => order.orderStatus === "COMPLETED")
    .length,
  totalValue: orders.reduce((sum, order) => sum + (order.finalAmount || 0), 0),
});

export const getOrderStatusClass = (status?: string) => {
  const statusKey = status?.toUpperCase() ?? "";
  const classes: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NEW: "bg-purple-100 text-purple-800",
  };
  return classes[statusKey] || "bg-gray-100 text-gray-800";
};

export const getOrderStatusLabel = (status?: string) => {
  const statusKey = status?.toUpperCase() ?? "";
  const labels: Record<string, string> = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NEW: "Mới",
  };
  return labels[statusKey] || status || "N/A";
};
