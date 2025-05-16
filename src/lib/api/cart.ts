import api from './axios';

// Interface for sending cart item data to the API
export interface CartItem {
  productCatalogueId: string;
  quantity: number;
  packageId?: string;
}

// Extended interface for cart items with display information
export interface CartItemWithDetails {
  _id: string;
  cartId: string;
  productCatalogueId: string;
  packageId: string;
  sellingPrice: number;
  costPrice: number;
  name: string;
  quantity: number;
  subTotal: number;
  costTotal: number;
  createdAt: string;
  updatedAt: string;
  product: {
    name: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    images: string[];
    // Other properties as needed
  };
}

export interface CartResponse {
  cart: {
    total: number;
    userId: string;
    costTotal: number;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
  cartItems: CartItemWithDetails[];
}

const cartApi = {
  // Add item to cart
  addToCart: async (item: CartItem): Promise<CartResponse> => {
    const response = await api.post<CartResponse>('/cart', item);
    return response.data;
  },

  // Get cart contents
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    productCatalogueId: string,
    quantity: number
  ): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(`/cart/${productCatalogueId}`, {
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productCatalogueId: string): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/${productCatalogueId}`);
    return response.data;
  },

  // Clear cart by removing all items
  clearCart: async (): Promise<void> => {
    try {
      // First get all cart items
      const cartData = await cartApi.getCart();
      
      // Then remove each item individually with error handling
      if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
        for (const item of cartData.cartItems) {
          try {
            await cartApi.removeFromCart(item.productCatalogueId);
          } catch (error) {
            console.error(`Failed to remove item ${item.productCatalogueId}:`, error);
            // Continue with other items even if one fails
          }
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};

export default cartApi;
