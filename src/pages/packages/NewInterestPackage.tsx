import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import packagesApi, {
  InitiateIBPackageParams,
  InitiateIBPackageResponse,
} from '../../lib/api/packages';
import { toast } from 'react-hot-toast';

// Error type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: number;
    };
  };
  message: string;
}

// Lock period options in days (1 month, 3 months, 6 months, 1 year)
const lockPeriodOptions = [
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
  { label: '2 Years', value: 730 },
];

// Compounding frequency options
const compoundingOptions = [
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
];

// Fixed interest rates based on lock period
const getInterestRateForPeriod = (lockPeriod: number): number => {
  switch (lockPeriod) {
    case 30:
      return 8; // 1 month - 8%
    case 90:
      return 10; // 3 months - 10%
    case 180:
      return 12.5; // 6 months - 12.5%
    case 365:
      return 15; // 1 year - 15%
    case 730:
      return 17.5; // 2 years - 17.5%
    default:
      return 10; // default 10%
  }
};

function NewInterestPackage() {
  const [formData, setFormData] = useState<InitiateIBPackageParams>({
    name: '',
    principalAmount: 0,
    interestRate: 10,
    lockPeriod: 0,
    compoundingFrequency: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    principalAmount: '',
    lockPeriod: '',
    compoundingFrequency: '',
  });

  const [enableCompounding, setEnableCompounding] = useState(false);
  const [showCompoundingInfo, setShowCompoundingInfo] = useState(false);

  // Update interest rate when lock period changes
  useEffect(() => {
    if (formData.lockPeriod > 0) {
      setFormData((prev) => ({
        ...prev,
        interestRate: getInterestRateForPeriod(prev.lockPeriod),
      }));
    }
  }, [formData.lockPeriod]);

  // Reset compounding frequency when compounding is disabled
  useEffect(() => {
    if (!enableCompounding) {
      setFormData((prev) => ({
        ...prev,
        compoundingFrequency: '',
      }));
    } else if (enableCompounding && !formData.compoundingFrequency) {
      // Set default compounding frequency when enabling
      setFormData((prev) => ({
        ...prev,
        compoundingFrequency: 'quarterly',
      }));
    }
  }, [enableCompounding]);

  const calculatedMaturityAmount = () => {
    if (formData.principalAmount <= 0 || formData.lockPeriod <= 0) {
      return 0;
    }

    const principal = formData.principalAmount;
    const rate = formData.interestRate / 100;
    const period = formData.lockPeriod / 365; // Convert days to years

    if (!enableCompounding) {
      // Simple interest calculation
      const interest = principal * rate * period;
      return principal + interest;
    } else {
      // Compound interest calculation
      const compoundFrequency =
        formData.compoundingFrequency === 'quarterly' ? 4 : 1;
      const compoundPeriods = period * compoundFrequency;
      const maturityAmount =
        principal * Math.pow(1 + rate / compoundFrequency, compoundPeriods);
      return maturityAmount;
    }
  };

  const initiatePaymentMutation = useMutation<
    InitiateIBPackageResponse,
    ApiError,
    InitiateIBPackageParams
  >({
    mutationFn: (data: InitiateIBPackageParams) =>
      packagesApi.initiateIBPackagePayment(data),
    onSuccess: (response: InitiateIBPackageResponse) => {
      // Store the payment details in session storage for retrieval after payment
      sessionStorage.setItem(
        'interestPackagePayment',
        JSON.stringify({
          reference: response.reference,
          data: formData,
        })
      );

      // Construct the callback URL for Paystack
      const callbackUrl = `${window.location.origin}/packages/new/interest/callback`;

      // Redirect to Paystack payment page with the callback URL
      window.location.href = `${
        response.authorization_url
      }&callback_url=${encodeURIComponent(callbackUrl)}`;
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || 'Failed to initiate payment'
      );
    },
  });

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      principalAmount: '',
      lockPeriod: '',
      compoundingFrequency: '',
    };

    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Package name is required';
      isValid = false;
    }

    if (formData.principalAmount <= 0) {
      errors.principalAmount = 'Please enter a valid amount';
      isValid = false;
    } else if (formData.principalAmount < 10000) {
      errors.principalAmount = 'Minimum amount is ₦10,000';
      isValid = false;
    }

    if (formData.lockPeriod <= 0) {
      errors.lockPeriod = 'Please select a lock period';
      isValid = false;
    }

    if (enableCompounding && !formData.compoundingFrequency) {
      errors.compoundingFrequency = 'Please select compounding frequency';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'principalAmount') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value),
      });
    } else if (name === 'lockPeriod') {
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

  const toggleCompounding = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnableCompounding(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show a confirmation dialog before proceeding
    const confirmed = window.confirm(
      `You are about to create an Interest-Based Package with:\n\n` +
        `• Principal Amount: ₦${formData.principalAmount.toLocaleString()}\n` +
        `• Interest Rate: ${formData.interestRate}% p.a.\n` +
        `• Lock Period: ${
          lockPeriodOptions.find(
            (option) => option.value === formData.lockPeriod
          )?.label
        }\n` +
        `${
          enableCompounding
            ? `• Compounding: ${
                formData.compoundingFrequency === 'quarterly'
                  ? 'Quarterly'
                  : 'Annually'
              }\n`
            : '• Simple Interest (no compounding)\n'
        }\n` +
        `Your funds will be locked for this period. Early withdrawal may incur penalties.\n\n` +
        `Do you wish to proceed?`
    );

    if (!confirmed) {
      return;
    }

    // Create API request data
    const apiData: InitiateIBPackageParams = {
      name: formData.name,
      principalAmount: formData.principalAmount,
      interestRate: formData.interestRate,
      lockPeriod: formData.lockPeriod,
    };

    // Only include compounding frequency if enabled
    if (enableCompounding && formData.compoundingFrequency) {
      apiData.compoundingFrequency = formData.compoundingFrequency;
    }

    initiatePaymentMutation.mutate(apiData);
  };

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
        <h1 className="text-2xl font-bold text-[#212529]">
          Interest-Based Investment
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 p-4 bg-[#F8F9FA] border-l-4 border-[#0066A1] rounded">
          <h3 className="font-medium text-[#212529] mb-1">
            Important Information
          </h3>
          <p className="text-sm text-[#6c757d]">
            Interest-based packages lock your funds for a fixed period in
            exchange for guaranteed returns. The interest rate is determined by
            your selected lock period. Early withdrawal may incur penalties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#495057] mb-1"
            >
              Package Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Retirement Fund, Education Savings"
              className={`w-full p-3 border ${
                formErrors.name ? 'border-red-500' : 'border-[#CED4DA]'
              } rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="principalAmount"
              className="block text-sm font-medium text-[#495057] mb-1"
            >
              Principal Amount (₦)*
            </label>
            <input
              type="number"
              id="principalAmount"
              name="principalAmount"
              value={
                formData.principalAmount === 0 ? '' : formData.principalAmount
              }
              onChange={handleChange}
              placeholder="Enter amount (minimum ₦10,000)"
              min="10000"
              step="1000"
              className={`w-full p-3 border ${
                formErrors.principalAmount
                  ? 'border-red-500'
                  : 'border-[#CED4DA]'
              } rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition`}
            />
            {formErrors.principalAmount ? (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.principalAmount}
              </p>
            ) : (
              <p className="text-xs text-[#6c757d] mt-1">
                Minimum amount: ₦10,000
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lockPeriod"
              className="block text-sm font-medium text-[#495057] mb-1"
            >
              Lock Period*
            </label>
            <select
              id="lockPeriod"
              name="lockPeriod"
              value={formData.lockPeriod || ''}
              onChange={handleChange}
              className={`w-full p-3 border ${
                formErrors.lockPeriod ? 'border-red-500' : 'border-[#CED4DA]'
              } rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition`}
            >
              <option value="">Select lock period</option>
              {lockPeriodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({getInterestRateForPeriod(option.value)}%
                  p.a.)
                </option>
              ))}
            </select>
            {formErrors.lockPeriod && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.lockPeriod}
              </p>
            )}
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCompounding"
                  checked={enableCompounding}
                  onChange={toggleCompounding}
                  className="h-4 w-4 text-[#0066A1] border-[#CED4DA] rounded focus:ring-[#0066A1]"
                />
                <label
                  htmlFor="enableCompounding"
                  className="ml-2 text-sm font-medium text-[#495057]"
                >
                  Enable Compound Interest
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowCompoundingInfo(!showCompoundingInfo)}
                className="text-xs text-[#0066A1] hover:underline"
              >
                {showCompoundingInfo ? 'Hide Info' : 'What is this?'}
              </button>
            </div>

            {showCompoundingInfo && (
              <div className="bg-[#F8F9FA] p-3 rounded text-sm text-[#6c757d] mb-3">
                <h4 className="font-medium text-[#495057] mb-1">
                  About Compound Interest
                </h4>
                <p className="mb-2">
                  Compound interest allows you to earn interest on your
                  interest, potentially increasing your returns.
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li>
                    <strong>Simple Interest:</strong> Interest calculated only
                    on the principal amount.
                  </li>
                  <li>
                    <strong>Compound Interest:</strong> Interest calculated on
                    both the principal and accumulated interest.
                  </li>
                  <li>
                    <strong>Quarterly:</strong> Interest compounded 4 times per
                    year (higher returns).
                  </li>
                  <li>
                    <strong>Annually:</strong> Interest compounded once per
                    year.
                  </li>
                </ul>
                <p>
                  Example: ₦100,000 at 10% for 1 year with quarterly compounding
                  yields ₦110,381 vs ₦110,000 with simple interest.
                </p>
              </div>
            )}

            {enableCompounding && (
              <div className="mt-3">
                <label
                  htmlFor="compoundingFrequency"
                  className="block text-sm font-medium text-[#495057] mb-1"
                >
                  Compounding Frequency*
                </label>
                <select
                  id="compoundingFrequency"
                  name="compoundingFrequency"
                  value={formData.compoundingFrequency}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.compoundingFrequency
                      ? 'border-red-500'
                      : 'border-[#CED4DA]'
                  } rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition`}
                >
                  <option value="">Select compounding frequency</option>
                  {compoundingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.compoundingFrequency && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.compoundingFrequency}
                  </p>
                )}
              </div>
            )}
          </div>

          {formData.lockPeriod > 0 && formData.principalAmount > 0 && (
            <div className="bg-[#F6F8FA] rounded-lg p-4 mt-6">
              <h3 className="font-medium text-[#212529] mb-2">
                Package Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Principal Amount:</span>
                  <span className="font-medium text-[#212529]">
                    ₦{formData.principalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Interest Rate:</span>
                  <span className="font-medium text-[#212529]">
                    {formData.interestRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Lock Period:</span>
                  <span className="font-medium text-[#212529]">
                    {
                      lockPeriodOptions.find(
                        (option) => option.value === formData.lockPeriod
                      )?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Interest Type:</span>
                  <span className="font-medium text-[#212529]">
                    {enableCompounding
                      ? `Compound (${
                          formData.compoundingFrequency === 'quarterly'
                            ? 'Quarterly'
                            : 'Annually'
                        })`
                      : 'Simple Interest'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">
                    Estimated Maturity Amount:
                  </span>
                  <span className="font-medium text-[#212529]">
                    ₦
                    {calculatedMaturityAmount().toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <span className="text-[#6c757d] text-xs">
                    Early withdrawal may incur penalties as determined by the
                    bank.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors flex items-center justify-center"
              disabled={initiatePaymentMutation.isPending}
            >
              {initiatePaymentMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>

          <p className="text-xs text-[#6c757d] text-center">
            By proceeding, you agree to lock your funds for the selected period,
            subject to our terms and conditions.
          </p>
        </form>
      </div>
    </div>
  );
}

export default NewInterestPackage;
