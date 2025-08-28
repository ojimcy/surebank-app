import React, { createContext, useContext, useEffect, useState } from 'react';

// Local cart product interface
export interface LocalCartProduct {
  id: string;
  _id?: string; // Alternative ID field for compatibility
  name: string;
  image: string;
  sellingPrice: number;
  category?: string;
  averageRating: number;
  addedAt: string; // ISO string
}

// Cart context interface
interface CartContextType {
  cartItems: LocalCartProduct[];
  cartCount: number;
  addToCart: (product: Omit<LocalCartProduct, 'addedAt'>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key
const LOCAL_CART_KEY = 'sb-product-cart';

// Helper functions for localStorage operations
const getCartFromStorage = (): LocalCartProduct[] => {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (items: LocalCartProduct[]): void => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<LocalCartProduct[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = getCartFromStorage();
    setCartItems(savedCart);
  }, []);

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (product: Omit<LocalCartProduct, 'addedAt'>) => {
    const productWithTimestamp: LocalCartProduct = {
      ...product,
      id: product.id || product._id || '', // Ensure we have an ID
      addedAt: new Date().toISOString(),
    };

    setCartItems(prevItems => {
      // Remove existing item with same ID if it exists, then add the new one
      const filtered = prevItems.filter(item => item.id !== productWithTimestamp.id);
      return [...filtered, productWithTimestamp];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (productId: string): boolean => {
    return cartItems.some(item => item.id === productId);
  };

  const cartCount = cartItems.length;

  const contextValue: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useLocalCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useLocalCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;