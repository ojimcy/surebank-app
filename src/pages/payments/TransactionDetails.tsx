    import { useParams, useNavigate } from 'react-router-dom';
import { useTransactionQueries } from '@/hooks/queries/useTransactionQueries';
import { useToast } from '@/lib/toast-provider';
import { useEffect, useState } from 'react';
import { FormattedTransaction } from '@/hooks/queries/useTransactionQueries';

export default function TransactionDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [transaction, setTransaction] = useState<FormattedTransaction | null>(null);
  
  const { formattedTransactions, isTransactionsLoading } = useTransactionQueries();

  useEffect(() => {
    if (!transactionId) {
      showError({
        title: 'Invalid Transaction',
        description: 'Transaction ID not found',
      });
      navigate('/payments/history');
      return;
    }

    // Find the transaction from the formatted transactions
    if (formattedTransactions.length > 0) {
      const foundTransaction = formattedTransactions.find(t => t.id === transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
      } else {
        showError({
          title: 'Transaction Not Found',
          description: 'The requested transaction could not be found',
        });
        navigate('/payments/history');
      }
    }
  }, [transactionId, formattedTransactions, navigate, showError]);

  if (isTransactionsLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full mr-3"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Transaction Details</h1>
          </div>
          
          <div className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full mr-3"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Transaction Details</h1>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-500">Transaction not found</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNarration = (narration: string) => {
    // Capitalize first letter and format for better readability
    return narration.charAt(0).toUpperCase() + narration.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Transaction Details</h1>
        </div>

        {/* Transaction Status Card */}
        <div className="bg-white rounded-lg p-6 mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#E5E8ED]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${
                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
              }`}
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
          
          <h2 className="text-lg font-semibold mb-2">
            {transaction.type === 'deposit' ? 'Money Received' : 
             transaction.type === 'withdrawal' ? 'Money Sent' : 'Transaction'}
          </h2>
          
          <div className={`text-2xl font-bold mb-2 ${
            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'deposit' ? '+ ' : '- '}₦{transaction.amount.toLocaleString()}
          </div>
          
          {transaction.rawTransaction.status && (
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(transaction.rawTransaction.status)}`}>
              {transaction.rawTransaction.status}
            </span>
          )}
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Category</span>
              <span className="font-medium text-right">{transaction.category}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Date & Time</span>
              <div className="text-right">
                <div className="font-medium">{transaction.date}</div>
                <div className="text-sm text-gray-500">{transaction.time}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-right break-all">{transaction.id}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Direction</span>
              <span className={`font-medium ${
                transaction.rawTransaction.direction === 'inflow' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.rawTransaction.direction === 'inflow' ? 'Incoming' : 'Outgoing'}
              </span>
            </div>
            
            {transaction.rawTransaction.penaltyAmount > 0 && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Penalty Amount</span>
                <span className="font-medium text-red-600">
                  ₦{transaction.rawTransaction.penaltyAmount.toLocaleString()}
                </span>
              </div>
            )}
            
            {transaction.rawTransaction.bankName && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Bank</span>
                <span className="font-medium">{transaction.rawTransaction.bankName}</span>
              </div>
            )}
            
            {transaction.rawTransaction.bankAccountNumber && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Bank Account</span>
                <span className="font-medium">{transaction.rawTransaction.bankAccountNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description/Narration */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <p className="text-gray-700 leading-relaxed">
            {formatNarration(transaction.rawTransaction.narration)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/payments/history')}
            className="w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0056B3] transition-colors"
          >
            View All Transactions
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 