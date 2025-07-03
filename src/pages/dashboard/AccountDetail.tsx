import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { Account } from '@/lib/api/accounts';
import { useToast } from '@/lib/toast-provider';
import {
  ArrowLeft,
  CreditCard,
  User,
  Building,
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Plus,
  Minus,
  Activity
} from 'lucide-react';

export default function AccountDetail() {
  const { accountType } = useParams<{ accountType: 'ds' | 'sb' | 'ibs' }>();
  const navigate = useNavigate();
  const { getAccountByType } = useAccountQueries();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get account type display name
  const getAccountTypeLabel = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'ds':
        return 'Daily Savings';
      case 'sb':
        return 'Surebank';
      case 'ibs':
        return 'Investment Banking Services';
      default:
        return type?.toUpperCase() || 'Unknown';
    }
  };

  // Get status color classes
  const getStatusClasses = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get account type color classes
  const getAccountTypeClasses = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'ds':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sb':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ibs':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
  }, [accountType, showError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[--primary] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Account Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The account you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-[--primary] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Account Details</h1>
                <p className="text-sm text-gray-500">
                  {getAccountTypeLabel(account.accountType)} Account
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview Card */}
        <div className="bg-gradient-to-r from-[--primary] to-blue-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {account.firstName} {account.lastName}
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccountTypeClasses(account.accountType)} bg-white/20 text-white border-white/30`}>
                      {getAccountTypeLabel(account.accountType)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(account.status)} bg-white/20 text-white border-white/30`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/70 text-sm mb-1">Available Balance</p>
                <p className="text-4xl font-bold mb-2">
                  {formatCurrency(account.availableBalance)}
                </p>
                <p className="text-white/70 text-sm font-mono">
                  Account: {account.accountNumber}
                </p>
              </div>
              <div className="flex items-end justify-end">
                <div className="text-right">
                  <p className="text-white/70 text-sm">Branch</p>
                  <p className="text-lg font-semibold">{account.branchId.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Deposit</h3>
            <p className="text-sm text-gray-500">Add money to account</p>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
              <Minus className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Withdraw</h3>
            <p className="text-sm text-gray-500">Withdraw funds</p>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Transactions</h3>
            <p className="text-sm text-gray-500">View transaction history</p>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-500">View account insights</p>
          </button>
        </div>

        {/* Account Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Account Type
                    </label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getAccountTypeClasses(account.accountType)}`}>
                      {getAccountTypeLabel(account.accountType)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Account Number
                    </label>
                    <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                      {account.accountNumber}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClasses(account.status)}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Branch
                    </label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{account.branchId.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Created On
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{formatDate(account.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{formatDate(account.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Holder Information */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Account Holder</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-[--primary] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-semibold text-lg">
                      {account.firstName.charAt(0)}{account.lastName.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {account.firstName} {account.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">Account Holder</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {account.phoneNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Balance
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(account.availableBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
