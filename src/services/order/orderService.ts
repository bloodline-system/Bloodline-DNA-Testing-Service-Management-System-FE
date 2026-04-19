import axios from "@/lib/axios";

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
  [key: string]: any;
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
    availableStaff: Array<{ id: number; name: string; [key: string]: any }>;
    orders: Order[];
    [key: string]: any;
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
    return response.data;
  }

  /**
   * Get new orders (orders that need staff assignment)
   */
  async getNewOrders(): Promise<NewOrdersResponse> {
    const response = await axios.get("/api/v1/manager/orders/new");
    return response.data;
  }

  /**
   * Get single order by ID
   */
  async getOrderById(id: number): Promise<any> {
    const response = await axios.get(`/api/v1/manager/orders/${id}`);
    return response.data;
  }

  /**
   * Assign staff to an order for sample collection
   */
  async assignCollectionStaff(
    orderId: number,
    staffId: number
  ): Promise<any> {
    const response = await axios.post(
      `/api/v1/manager/orders/${orderId}/assign-collection-staff`,
      { staffId }
    );
    return response.data;
  }

  /**
   * Assign staff to an order for analysis
   */
  async assignAnalysisStaff(
    orderId: number,
    staffId: number
  ): Promise<any> {
    const response = await axios.post(
      `/api/v1/manager/orders/${orderId}/assign-analysis-staff`,
      { staffId }
    );
    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<any> {
    const response = await axios.put(
      `/api/v1/manager/orders/${orderId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    testTypeId: number;
    customerName: string;
    email: string;
    phone: string;
    address: string;
  }): Promise<any> {
    const response = await axios.post("/api/v1/orders", orderData);
    return response.data;
  }
}

export default new OrderService();
