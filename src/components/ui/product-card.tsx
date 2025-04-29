import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Star, Image } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
  onAddToCart?: (id: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  rating = 0,
  category,
  onAddToCart,
  className,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group h-full flex flex-col',
        className
      )}
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {!imageError && image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <Image className="h-10 w-10 mb-2 opacity-50" />
            <span className="text-xs font-medium">{name.split(' ')[0]}</span>
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-colors duration-200 opacity-90 hover:opacity-100"
          aria-label="Add to cart"
        >
          <Plus className="h-5 w-5" />
        </button>
        {category && (
          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {description}
          </p>
        )}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
        <div className="mt-auto">
          <p className="font-bold text-primary text-lg">{formatPrice(price)}</p>
        </div>
      </div>
    </div>
  );
}
