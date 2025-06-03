import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionQueries } from '@/hooks/queries/useTransactionQueries';
import { TransactionFilters } from '@/lib/api/transactions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

// Define date range options
type DateRangeOption = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export default function TransactionHistory() {
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Filter states
  const [transactionType, setTransactionType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({ page: currentPage, limit: pageSize });
  
  // Calculate date range timestamps based on selection
  const getDateRangeTimestamps = (option: DateRangeOption): { startDate?: number; endDate?: number } => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Variables declared outside switch to avoid lexical declaration errors
    let startOfDay: Date;
    let startOfWeek: Date;
    let startOfMonth: Date;
    let startOfYear: Date;
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    switch (option) {
      case 'today':
        startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return {
          startDate: startOfDay.getTime(),
          endDate: endOfDay.getTime()
        };
      case 'week':
        startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        return {
          startDate: startOfWeek.getTime(),
          endDate: endOfDay.getTime()
        };
      case 'month':
        startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return {
          startDate: startOfMonth.getTime(),
          endDate: endOfDay.getTime()
        };
      case 'year':
        startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        return {
          startDate: startOfYear.getTime(),
          endDate: endOfDay.getTime()
        };
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : undefined;
        endDate = customEndDate ? new Date(customEndDate) : undefined;
        
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);
        
        return {
          startDate: startDate?.getTime(),
          endDate: endDate?.getTime()
        };
      default:
        return {}; // 'all' option - no date filtering
    }
  };
  
  // Apply filters and reset to page 1
  const applyFilters = () => {
    const dateFilters = getDateRangeTimestamps(dateRange);
    const directionFilter = transactionType !== 'all' ? transactionType : undefined;
    
    setCurrentPage(1); // Reset to first page when applying new filters
    
    setAppliedFilters({
      page: 1,
      limit: pageSize,
      direction: directionFilter,
      ...dateFilters
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setTransactionType('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDateInputs(false);
    setCurrentPage(1);
    setAppliedFilters({ page: 1, limit: pageSize });
  };
  
  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    const option = value as DateRangeOption;
    setDateRange(option);
    setShowCustomDateInputs(option === 'custom');
  };
  
  // Update applied filters when page changes
  useEffect(() => {
    setAppliedFilters(prev => ({ ...prev, page: currentPage }));
  }, [currentPage]);
  
  // Use the updated hook with filters
  const {
    formattedTransactions,
    pagination,
    isTransactionsLoading,
    prefetchNextPage
  } = useTransactionQueries(appliedFilters);

  // Prefetch next page for smoother pagination
  useEffect(() => {
    if (pagination && currentPage < pagination.totalPages) {
      prefetchNextPage();
    }
  }, [currentPage, pagination, prefetchNextPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransactionClick = (transactionId: string) => {
    navigate(`/payments/transaction/${transactionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#212529]">Transaction History</h1>
        <p className="text-[#6c757d]">View all your transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="w-full md:w-auto">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              id="type"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as 'all' | 'inflow' | 'outflow')}
            >
              <option value="all">All Transactions</option>
              <option value="inflow">Deposits Only</option>
              <option value="outflow">Withdrawals Only</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {showCustomDateInputs && (
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="ml-auto self-end flex gap-2">
            <button 
              onClick={resetFilters}
              className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={applyFilters}
              className="bg-[#0066A1] text-white px-4 py-2 rounded-md text-sm hover:bg-[#005085] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* Active filters display */}
        {(transactionType !== 'all' || dateRange !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {transactionType !== 'all' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {transactionType === 'inflow' ? 'Deposits Only' : 'Withdrawals Only'}
              </span>
            )}
            {dateRange !== 'all' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {dateRange === 'custom' 
                  ? `${customStartDate || 'Any'} to ${customEndDate || 'Any'}`
                  : dateRange === 'today' ? 'Today' 
                  : dateRange === 'week' ? 'This Week' 
                  : dateRange === 'month' ? 'This Month' 
                  : 'This Year'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isTransactionsLoading ? (
          // Loading skeleton
          <div className="p-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border-b border-gray-100 py-4 flex items-center">
                <Skeleton className="w-10 h-10 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-2 ml-auto" />
                  <Skeleton className="h-3 w-24 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : formattedTransactions.length > 0 ? (
          <div>
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-4 bg-gray-50 p-4 font-medium text-sm text-gray-600">
              <div>Transaction</div>
              <div>Date & Time</div>
              <div>Status</div>
              <div className="text-right">Amount</div>
            </div>
            
            {/* Transactions List */}
            <div>
              {formattedTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Mobile View */}
                  <div className="md:hidden p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#0066A1]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {transaction.type === 'deposit' ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </p>
                        <p className="text-xs text-[#6c757d]">{transaction.category}</p>
                      </div>
                      <div className="ml-auto">
                        <p
                          className={`font-medium ${
                            transaction.type === 'deposit'
                              ? 'text-[#28A745]'
                              : transaction.type === 'withdrawal'
                              ? 'text-[#DC3545]'
                              : 'text-gray-800' // Neutral color for 'other'
                          }`}
                        >
                          {transaction.type === 'deposit' ? '+ ' : '- '}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-[#6c757d] mt-2">
                      <span>{transaction.date}, {transaction.time}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {transaction.rawTransaction.status || 'completed'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-4 p-4 items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#0066A1]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {transaction.type === 'deposit' ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </p>
                        <p className="text-xs text-[#6c757d]">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.date}, {transaction.time}
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {transaction.rawTransaction.status || 'completed'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          transaction.type === 'deposit'
                            ? 'text-[#28A745]'
                            : transaction.type === 'withdrawal'
                            ? 'text-[#DC3545]'
                            : 'text-gray-800' // Neutral color for 'other'
                        }`}
                      >
                        {transaction.type === 'deposit' ? '+ ' : '- '}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show current page, first, last, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageNumber
                              ? 'bg-[#0066A1] text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                    ) {
                      return <span key={pageNumber} className="px-2 py-1">...</span>;
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === pagination.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
            <p className="text-gray-500">
              You don't have any transactions yet. They will appear here once you make deposits or withdrawals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
