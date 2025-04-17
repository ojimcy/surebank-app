import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import packagesApi, {
  CreateDailySavingsPackageParams,
} from '../../lib/api/packages';
import { toast } from 'react-hot-toast';

// Error type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

function NewDailySavings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateDailySavingsPackageParams>({
    amountPerDay: 1000,
    target: '',
  });
  const [hasRequiredAccount, setHasRequiredAccount] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      setIsLoading(true);
      try {
        const hasAccount = await packagesApi.checkAccountType('ds');
        setHasRequiredAccount(hasAccount);
      } catch (error) {
        console.error('Error checking account:', error);
        setHasRequiredAccount(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccount();
  }, []);

  const createPackageMutation = useMutation({
    mutationFn: (data: CreateDailySavingsPackageParams) =>
      packagesApi.createDailySavingsPackage(data),
    onSuccess: () => {
      toast.success('Daily Savings package created successfully!');
      navigate('/packages/new/success', {
        state: {
          packageType: 'daily',
          target: formData.target,
          amount: formData.amountPerDay,
        },
      });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to create package');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'amountPerDay') {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPackageMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasRequiredAccount === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link
            to="/packages/new"
            className="p-2 rounded-full bg-[#F6F8FA] hover:bg-[#E5E8ED] transition-colors mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#212529]"
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
          </Link>
          <h1 className="text-2xl font-bold text-[#212529]">Daily Savings</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-medium text-[#212529] mb-2">
              Daily Savings Account Required
            </h2>
            <p className="text-[#6c757d] mb-6">
              You need to have a Daily Savings account before creating a
              package. Please visit one of our branches to set up your account.
            </p>
            <Link
              to="/packages"
              className="inline-block px-4 py-2 bg-[#0066A1] text-white rounded-lg hover:bg-[#005085] transition-colors"
            >
              Back to Packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link
          to="/packages/new"
          className="p-2 rounded-full bg-[#F6F8FA] hover:bg-[#E5E8ED] transition-colors mr-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#212529]"
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
        </Link>
        <h1 className="text-2xl font-bold text-[#212529]">Daily Savings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="target"
              className="block text-sm font-medium text-[#495057] mb-1"
            >
              Savings Target/Purpose
            </label>
            <input
              type="text"
              id="target"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="e.g., New Car, Laptop, Emergency Fund"
              className="w-full p-3 border border-[#CED4DA] rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="amountPerDay"
              className="block text-sm font-medium text-[#495057] mb-1"
            >
              Amount Per Day (₦)
            </label>
            <input
              type="number"
              id="amountPerDay"
              name="amountPerDay"
              value={formData.amountPerDay}
              onChange={handleChange}
              min="100"
              step="100"
              className="w-full p-3 border border-[#CED4DA] rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition"
              required
            />
            <p className="text-xs text-[#6c757d] mt-1">
              Minimum amount: ₦100 per day
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={createPackageMutation.isPending}
              className="w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0066A1] disabled:opacity-70"
            >
              {createPackageMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Package...
                </span>
              ) : (
                'Create Package'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewDailySavings;
