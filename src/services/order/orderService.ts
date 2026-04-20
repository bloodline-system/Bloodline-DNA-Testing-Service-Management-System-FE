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

export interface ServiceOrderByCustomerResponse {
  idServiceOrder: number;
  serviceId: number;
  medicalServiceName: string;
  appointmentDate: string;
  collectionType: string;
  collectionAddress: string;
  finalAmount: number;
  orderStatus: string;
  payments?: unknown;
}

export interface CustomerMedicalServiceResponse {
  id: number;
  serviceName: string;
  currentPrice?: number;
  serviceDescription?: string;
  isAvailable?: boolean;
  [key: string]: unknown;
}

export interface OrderTestKitResponse {
  id: number;
  kitName: string;
  kitType: string;
  sampleType: string;
  quantityOrdered: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderParticipantResponse {
  firstName: string;
  lastName: string;
  gender: string;
  dateBirth: string;
}

export interface CustomerOrderDetailResponse {
  orderDetails: ServiceOrderByCustomerResponse;
  orderTestKits: OrderTestKitResponse[];
  orderParticipants: OrderParticipantResponse[];
  paymentTotal: number;
  existingFeedback?: {
    id: number;
    orderId: number;
    feedbackTitle: string;
    feedbackContent: string;
    overallRating: number;
    responseContent?: string;
    respondedAt?: string;
    respondedByName?: string;
    [key: string]: unknown;
  } | null;
}

export interface CustomerOrderCreateRequest {
  idMedicalService: number;
  appointmentDate?: string;
  collectionType?: string;
  collectionAddress?: string;
  paymentMethod: string;
  paymentStatus?: string;
  idKit?: string;
  quantityKit?: number;
  promotionId?: number;
  participants?: Array<{
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
  }>;
}

export interface CustomerOrderParticipantRequest {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
}

export interface CustomerOrderKitRequest {
  kitTestId: number;
  quantityOrdered: number;
}

export interface CustomerOrderFormData {
  medicalServiceId: number;
  collectionTypes: Array<
    | string
    | {
        name?: string;
        description?: string;
        [key: string]: unknown;
      }
  >;
  username: string;
}

class OrderService {
  /**
   * Get all orders
   */
  async getAllOrders(): Promise<OrdersResponse> {
    const response = await axios.get("/v1/manager/orders");
    return response.data as OrdersResponse;
  }

  /**
   * Get new orders (orders that need staff assignment)
   */
  async getNewOrders(): Promise<NewOrdersResponse> {
    const response = await axios.get("/v1/manager/orders/new");
    return response.data as NewOrdersResponse;
  }

  /**
   * Get single order by ID
   */
  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    const response = await axios.get(`/v1/manager/orders/${id}`);
    return response.data as ApiResponse<Order>;
  }

  /**
   * Assign staff to an order for sample collection
   */
  async assignCollectionStaff(
    orderId: number,
    staffId: number,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/v1/manager/orders/${orderId}/assign-collection-staff`,
      { staffId },
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Assign staff to an order for analysis
   */
  async assignAnalysisStaff(
    orderId: number,
    staffId: number,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/v1/manager/orders/${orderId}/assign-analysis-staff`,
      { staffId },
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: string,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.put(`/v1/manager/orders/${orderId}/status`, {
      status,
    });
    return response.data as ApiResponse<unknown>;
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
    const response = await axios.post("/v1/orders", orderData);
    return response.data;
  }

  async createCustomerOrder(
    orderData: CustomerOrderCreateRequest,
  ): Promise<ApiResponse<ServiceOrderByCustomerResponse>> {
    const response = await axios.post("/v1/customer/orders", orderData);
    return response.data as ApiResponse<ServiceOrderByCustomerResponse>;
  }

  async addCustomerOrderParticipant(
    orderId: number,
    participant: CustomerOrderParticipantRequest,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/v1/customer/orders/${orderId}/participants`,
      participant,
    );
    return response.data as ApiResponse<unknown>;
  }

  async addCustomerOrderKit(
    orderId: number,
    kit: CustomerOrderKitRequest,
  ): Promise<ApiResponse<unknown>> {
    const response = await axios.post(
      `/v1/customer/orders/${orderId}/kits`,
      kit,
    );
    return response.data as ApiResponse<unknown>;
  }

  /**
   * Get order details by customer (from /v1/customer/orders/{id}/details endpoint)
   */
  async getOrderDetailsByCustomer(
    id: number,
  ): Promise<ApiResponse<CustomerOrderDetailResponse>> {
    const response = await axios.get(`/v1/customer/orders/${id}/details`);
    return response.data as ApiResponse<CustomerOrderDetailResponse>;
  }

  async getCustomerOrders(): Promise<
    ApiResponse<ServiceOrderByCustomerResponse[]>
  > {
    const response = await axios.get("/v1/customer/orders");
    return response.data as ApiResponse<ServiceOrderByCustomerResponse[]>;
  }

  async acceptCustomerOrder(orderId: number): Promise<ApiResponse<null>> {
    const response = await axios.post(`/v1/customer/orders/${orderId}/accept`);
    return response.data as ApiResponse<null>;
  }

  async cancelCustomerOrder(orderId: number): Promise<ApiResponse<null>> {
    const response = await axios.post(`/v1/customer/orders/${orderId}/cancel`);
    return response.data as ApiResponse<null>;
  }

  async getCustomerServices(): Promise<
    ApiResponse<CustomerMedicalServiceResponse[]>
  > {
    const response = await axios.get("/v1/customer/services");
    return response.data as ApiResponse<CustomerMedicalServiceResponse[]>;
  }

  async getCustomerOrderFormData(
    medicalServiceId: number,
  ): Promise<ApiResponse<CustomerOrderFormData>> {
    const response = await axios.get("/v1/customer/orders/form-data", {
      params: { medicalServiceId },
    });
    return response.data as ApiResponse<CustomerOrderFormData>;
  }
}

export default new OrderService();
