import axios from "@/lib/axios";

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

export interface Order {
  id: number;
  orderStatus: string;
  customerName?: string;
  email?: string;
  phone?: string;
  testType?: string;
  createdAt?: string;
  updatedAt?: string;
  totalPrice?: number;
  [key: string]: unknown;
}

export interface OrdersResponse {
  code: number;
  data: {
    orders: Order[];
    statusCounts: Record<string, number>;
    totalOrders: number;
    pageTitle: string;
  };
  message: string;
  timestamp: string;
}

export interface NewOrdersResponse {
  code: number;
  data: {
    availableStaff: Array<{ id: number; name: string; [key: string]: unknown }>;
    orders: Order[];
    [key: string]: unknown;
  };
  message: string;
  timestamp: string;
}

class OrderService {
  /**
   * Get all orders
   */
  async getAllOrders(): Promise<OrdersResponse> {
    const response = await axios.get("/api/v1/manager/orders");
    return response.data as OrdersResponse;
  }

  /**
   * Get new orders (orders that need staff assignment)
   */
  async getNewOrders(): Promise<NewOrdersResponse> {
    const response = await axios.get("/api/v1/manager/orders/new");
    return response.data as NewOrdersResponse;
  }

  /**
   * Get single order by ID
   */
  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    const response = await axios.get(`/api/v1/manager/orders/${id}`);
    return response.data as ApiResponse<Order>;
  }

  /**
   * Assign staff to an order for sample collection
   */
  async assignCollectionStaff(
    orderId: number,
    staffId: number
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/api/v1/manager/orders/${orderId}/assign-collection-staff`,
      { staffId }
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Assign staff to an order for analysis
   */
  async assignAnalysisStaff(
    orderId: number,
    staffId: number
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/api/v1/manager/orders/${orderId}/assign-analysis-staff`,
      { staffId }
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.put(
      `/api/v1/manager/orders/${orderId}/status`,
      { status }
    );
    return response.data as ApiResponse<unknown>;
  }
}

export default new OrderService();
