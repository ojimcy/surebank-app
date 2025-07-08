import { formatDateTime } from '@/lib/utils';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface PackageDetailsAccordionProps {
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  accountNumber?: string;
  lastContribution?: string;
  formatStatus: (status: string) => string;
  formatDate?: (date: string) => string;
  // Additional fields for different package types
  totalCount?: number;
  amountPerDay?: number;
  // SB Package specific fields
  productDetails?: {
    name: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    discount: number;
    quantity: number;
  };
  totalContribution?: number;
  remainingBalance?: number;
  // IBS specific fields
  name?: string;
  principalAmount?: number;
  currentBalance?: number;
  maturityDate?: string;
  lockPeriod?: number;
  interestRate?: string;
  interestAccrued?: number;
}

export function PackageDetailsAccordion({
  type,
  status,
  startDate,
  endDate,
  accountNumber,
  lastContribution,
  formatStatus,
  formatDate,
  totalCount,
  amountPerDay,
  productDetails,
  totalContribution,
  remainingBalance,
  name,
  principalAmount,
  currentBalance,
  maturityDate,
  lockPeriod,
  interestRate,
}: PackageDetailsAccordionProps) {
  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Use formatDate if provided, otherwise use formatDateTime
  const formatDateHelper = (date: string) => {
    if (formatDate) {
      return formatDate(date);
    }
    return formatDateTime(date);
  };
  return (
    <Accordion.Root type="single" collapsible className="mb-8">
      <Accordion.Item
        value="details"
        className="border rounded-lg overflow-hidden"
      >
        <Accordion.Trigger className="flex w-full justify-between items-center p-4 text-left font-medium text-gray-900 hover:bg-gray-50">
          <span>Package Details</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
        <Accordion.Content className="bg-white px-4 pb-4 pt-0 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="text-sm text-gray-600 space-y-4">
            {/* Common Package Details */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              {accountNumber && (
                <div>
                  <p className="font-medium text-gray-700">Account Number</p>
                  <p>{accountNumber}</p>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <p>{formatStatus(status)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Start Date</p>
                <p>{formatDateHelper(startDate)}</p>
              </div>
              {endDate && (
                <div>
                  <p className="font-medium text-gray-700">End Date</p>
                  <p>{formatDateHelper(endDate)}</p>
                </div>
              )}
              {lastContribution && (
                <div>
                  <p className="font-medium text-gray-700">Last Contribution</p>
                  <p>{formatDateHelper(lastContribution)}</p>
                </div>
              )}
            </div>

            {/* Daily Savings Package Details */}
            {type === 'Daily Savings' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Total Count</p>
                  <p>{totalCount || 0}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Amount Per Day</p>
                  <p>{formatCurrency(amountPerDay || 0)}</p>
                </div>
              </div>
            )}

            {/* SB Package Details */}
            {type === 'SB Package' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Product Name</p>
                  <p>{productDetails?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Price</p>
                  <p>{formatCurrency(productDetails?.sellingPrice || 0)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">
                    Total Contribution
                  </p>
                  <p>{formatCurrency(totalContribution || 0)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Remaining Balance</p>
                  <p>{formatCurrency(remainingBalance || 0)}</p>
                </div>
              </div>
            )}

            {/* Interest-Based Package Details */}
            {type === 'Interest-Based' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Name</p>
                  <p>{name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Principal Amount</p>
                  <p>{formatCurrency(principalAmount || 0)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Current Balance</p>
                  <p>{formatCurrency(currentBalance || 0)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Lock Period</p>
                  <p>{lockPeriod} days</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Maturity Date</p>
                  <p>{formatDateHelper(maturityDate || '')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Interest Rate</p>
                  <p>{interestRate}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Earned so far</p>
                  <p className="text-green-600">
                    {formatCurrency(
                      (currentBalance || 0) - (principalAmount || 0)
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
