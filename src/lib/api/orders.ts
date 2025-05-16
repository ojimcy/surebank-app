import api from './axios';

// Interface for delivery address
export interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  branchId?: string;
}

// Interface for order creation payload
export interface OrderCreatePayload {
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
}

// Interface for order response
export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  products: {
    packageId: string;
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const ordersApi = {
  // Create a new order
  createOrder: async (orderData: OrderCreatePayload): Promise<OrderResponse[]> => {
    const response = await api.post<OrderResponse[]>('/orders', orderData);
    return response.data;
  },

  // Process payment for an order using SB-Pay
  processPayment: async (orderId: string, packageId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(`/orders/${orderId}/sb-pay?packageId=${packageId}`);
    return response.data;
  },

  // Get a specific order by ID
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  // Get all orders for the current user
  getUserOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>('/orders/self');
    return response.data;
  }
};

export default ordersApi;
