import { Link, useNavigate } from 'react-router-dom';
import { useTransactionQueries, FormattedTransaction } from '@/hooks/queries/useTransactionQueries';
import { Skeleton } from '../ui/skeleton';

interface RecentTransactionsProps {
  transactions?: FormattedTransaction[];
}

export function RecentTransactions({ transactions: propTransactions }: RecentTransactionsProps) {
  const navigate = useNavigate();
  
  // Fetch transactions using the hook if not provided as props
  const {
    formattedTransactions = [],
    isTransactionsLoading,
  } = useTransactionQueries();
  
  // Use prop transactions if provided, otherwise use fetched transactions
  const displayTransactions = propTransactions || formattedTransactions;

  const handleTransactionClick = (transactionId: string) => {
    navigate(`/payments/transaction/${transactionId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#212529]">
          Recent Transactions
        </h2>
        <Link
          to="/payments/history"
          className="text-sm text-[#0066A1] hover:underline"
        >
          View All
        </Link>
      </div>
      
      {isTransactionsLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : displayTransactions.length > 0 ? (
        // Transactions list
        <div className="space-y-4">
          {displayTransactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction.id)}
              className="bg-white rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
            >
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
                    {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </p>
                  <p className="text-xs text-[#6c757d]">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium ${
                    transaction.type === 'deposit'
                      ? 'text-[#28A745]'
                      : 'text-[#DC3545]'
                  }`}
                >
                  {transaction.type === 'deposit' ? '+ ' : '- '}₦
                  {transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-[#6c757d]">
                  {transaction.date}, {transaction.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-[#6c757d]">No transactions found</p>
        </div>
      )}
    </div>
  );
}
