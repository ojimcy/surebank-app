import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { Account } from '@/lib/api/accounts';
import { useToast } from '@/lib/toast-provider';
import { formatCurrency } from '@/lib/utils';
import { format, isValid } from 'date-fns';

export default function AccountDetail() {
  const { accountType } = useParams<{ accountType: 'ds' | 'sb' | 'ibs' }>();
  const navigate = useNavigate();
  const { getAccountByType } = useAccountQueries();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);

 
 const formatDate = (dateString: string): string => {
   try {
     const date = new Date(dateString);
     if (!isValid(date)) {
       return 'Invalid date';
     }
     return format(date, "do MMM, yyyy");
   } catch (error) {
     console.error('Error formatting date:', error);
     return 'Invalid date';
   }
 };

  useEffect(() => {
    const fetchAccount = async () => {
      if (!accountType) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        const data = await getAccountByType(accountType);

        if (data === null) {
          setAccount(null);
          return;
        }

        setAccount(data);
      } catch (error) {
        // Only log errors that are not related to 404 (account not found)
        console.error('Error fetching account:', error);
        showError({
          title: 'Error',
          description: 'Failed to load account details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType, showError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary]"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Account Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The account you're looking for doesn't exist or you don't have access
          to it.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[--primary] text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Account Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Account Overview</h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-lg font-medium">
              {formatCurrency(account.availableBalance)}
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                account.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : account.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="font-medium">
              {account.accountType === 'ds'
                ? 'Daily Savings'
                : account.accountType === 'sb'
                ? 'Surebank'
                : 'Interest Based Savings'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Branch</p>
            <p className="font-medium">{account.branchId.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Created On</p>
            <p className="font-medium">{formatDate(account.createdAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium">{formatDate(account.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Account Holder Information */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Holder</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">
              {account.firstName} {account.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{account.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button className="flex-1 min-w-[120px] px-4 py-3 border border-[--primary] text-[--primary] rounded-lg hover:bg-gray-50 transition-colors">
          View Transactions
        </button>
      </div>
    </div>
  );
}
