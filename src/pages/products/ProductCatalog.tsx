function ProductCatalog() {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white"
            placeholder="Search products..."
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-[#0066A1] text-white rounded-full text-sm whitespace-nowrap">
            All
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap">
            Electronics
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap">
            Home & Kitchen
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap">
            Fashion
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap">
            Beauty
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Product Card 1 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-36 bg-gray-200 relative">
              <img
                src="https://placehold.co/300x200/e2e8f0/1e293b?text=Laptop"
                alt="Laptop"
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#0066A1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-gray-900 mb-1">HP Laptop</h3>
              <p className="text-sm text-gray-500 mb-2">
                Intel Core i5, 8GB RAM
              </p>
              <p className="font-bold text-[#0066A1]">₦450,000</p>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-36 bg-gray-200 relative">
              <img
                src="https://placehold.co/300x200/e2e8f0/1e293b?text=Smartphone"
                alt="Smartphone"
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#0066A1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-gray-900 mb-1">
                Samsung Galaxy S22
              </h3>
              <p className="text-sm text-gray-500 mb-2">128GB, 6GB RAM</p>
              <p className="font-bold text-[#0066A1]">₦380,000</p>
            </div>
          </div>

          {/* Product Card 3 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-36 bg-gray-200 relative">
              <img
                src="https://placehold.co/300x200/e2e8f0/1e293b?text=TV"
                alt="TV"
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#0066A1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-gray-900 mb-1">Sony Smart TV</h3>
              <p className="text-sm text-gray-500 mb-2">55 inch, 4K Ultra HD</p>
              <p className="font-bold text-[#0066A1]">₦600,000</p>
            </div>
          </div>

          {/* Product Card 4 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-36 bg-gray-200 relative">
              <img
                src="https://placehold.co/300x200/e2e8f0/1e293b?text=Headphones"
                alt="Headphones"
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#0066A1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-gray-900 mb-1">Bose Headphones</h3>
              <p className="text-sm text-gray-500 mb-2">Noise Cancelling</p>
              <p className="font-bold text-[#0066A1]">₦150,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCatalog;
