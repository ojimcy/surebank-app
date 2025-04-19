import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/ui/product-card';
import { cn } from '@/lib/utils';

// Mock data for products
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

// Category type
type Category = 'All' | 'Electronics' | 'Home & Kitchen' | 'Fashion' | 'Beauty';

function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'HP Laptop',
      description: 'Intel Core i5, 8GB RAM, 512GB SSD',
      price: 450000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Laptop',
      category: 'Electronics',
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Samsung Galaxy S22',
      description: '128GB, 6GB RAM, 5G',
      price: 380000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Smartphone',
      category: 'Electronics',
      rating: 4.2,
    },
    {
      id: '3',
      name: 'Sony Smart TV',
      description: '55 inch, 4K Ultra HD, Android TV',
      price: 600000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=TV',
      category: 'Electronics',
      rating: 4.8,
    },
    {
      id: '4',
      name: 'Bose Headphones',
      description: 'Wireless Noise Cancelling',
      price: 150000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Headphones',
      category: 'Electronics',
      rating: 4.7,
    },
    {
      id: '5',
      name: 'Modern Coffee Table',
      description: 'Wooden with Glass Top',
      price: 85000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Table',
      category: 'Home & Kitchen',
      rating: 4.0,
    },
    {
      id: '6',
      name: 'Designer T-Shirt',
      description: 'Premium Cotton, Multiple Sizes',
      price: 12000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Tshirt',
      category: 'Fashion',
      rating: 3.8,
    },
    {
      id: '7',
      name: 'Face Serum',
      description: 'Anti-Aging, 30ml',
      price: 25000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Serum',
      category: 'Beauty',
      rating: 4.6,
    },
    {
      id: '8',
      name: 'Blender',
      description: 'High-Speed, 1000W',
      price: 45000,
      image: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Blender',
      category: 'Home & Kitchen',
      rating: 4.3,
    },
  ];

  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category tabs
  const categories: Category[] = [
    'All',
    'Electronics',
    'Home & Kitchen',
    'Fashion',
    'Beauty',
  ];

  const handleAddToCart = (id: string) => {
    // Implementation would go here in a real app
    console.log(`Added product ${id} to cart`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header with page title and cart button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button className="p-2 relative rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            0
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            className={cn(
              'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image}
              category={product.category}
              rating={product.rating}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-gray-500">
            No products found. Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
