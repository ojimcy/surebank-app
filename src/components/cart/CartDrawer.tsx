import React from 'react';
import { X, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalCart, LocalCartProduct } from '@/lib/cart-provider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemProps {
  product: LocalCartProduct;
  onCreatePackage: (productId: string) => void;
  onRemove: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ product, onCreatePackage, onRemove }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder on image error
              (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/e2e8f0/1e293b?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
        <p className="text-sm text-gray-500">{product.category || 'General'}</p>
        <p className="text-sm font-semibold text-[#0066A1]">
          {formatCurrency(product.sellingPrice)}
        </p>
        {product.averageRating > 0 && (
          <div className="flex items-center mt-1">
            <span className="text-xs text-yellow-500">★</span>
            <span className="text-xs text-gray-600 ml-1">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Button
          size="sm"
          onClick={() => onCreatePackage(product.id)}
          className="bg-[#0066A1] hover:bg-[#0066A1]/90 text-white text-xs px-3 py-1"
        >
          <Plus className="w-3 h-3 mr-1" />
          Create Package
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(product.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { cartItems, removeFromCart, clearCart } = useLocalCart();

  const handleCreatePackage = (productId: string) => {
    // Navigate to SB package creation with pre-selected product
    navigate(`/packages/new/sb?productId=${productId}`);
    onClose(); // Close the drawer
    
    addToast({
      title: 'Creating SB Package',
      description: 'Redirecting to package creation with selected product.',
      variant: 'default',
    });
  };

  const handleRemoveProduct = (productId: string) => {
    removeFromCart(productId);
    
    addToast({
      title: 'Product Removed',
      description: 'Product removed from your selection.',
      variant: 'default',
    });
  };

  const handleClearAll = () => {
    clearCart();
    
    addToast({
      title: 'Cart Cleared',
      description: 'All products removed from your selection.',
      variant: 'default',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#0066A1]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Selection
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products selected
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Add products to create SB packages with them later.
                  </p>
                  <Button onClick={onClose} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      {cartItems.length} product{cartItems.length !== 1 ? 's' : ''} selected
                    </p>
                    {cartItems.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-red-500 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {cartItems.map((product) => (
                      <CartItem
                        key={product.id}
                        product={product}
                        onCreatePackage={handleCreatePackage}
                        onRemove={handleRemoveProduct}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  Select a product above to create an SB package with it
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;