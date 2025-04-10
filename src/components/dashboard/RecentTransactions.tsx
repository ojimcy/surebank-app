import { Link } from 'react-router-dom';
import { Transaction } from './types';

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Sample transactions if none provided
  const defaultTransactions: Transaction[] = [
    {
      id: 1,
      type: 'deposit',
      category: 'Daily Savings',
      amount: 5000,
      date: 'Today',
      time: '10:30 AM',
    },
    {
      id: 2,
      type: 'withdrawal',
      category: 'Interest Package',
      amount: 15000,
      date: 'Yesterday',
      time: '2:15 PM',
    },
  ];

  const displayTransactions = transactions || defaultTransactions;

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
      <div className="space-y-4">
        {displayTransactions.map((transaction) => (
          <div
            key={transaction.id}
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
    </div>
  );
}
