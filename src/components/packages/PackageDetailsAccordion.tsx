import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface PackageDetailsAccordionProps {
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  lastContribution?: string;
  formatDate: (date: string) => string;
  formatStatus: (status: string) => string;
  // Additional fields for different package types
  amountPerDay?: number;
  interestRate?: string;
  compoundingFrequency?: string;
  lockPeriod?: number;
  interestAccrued?: number;
  earlyWithdrawalPenalty?: number;
  currentBalance?: number;
  estimatedEarnings?: number;
  productDetails?: {
    name: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    discount: number;
    quantity: number;
  };
}

export function PackageDetailsAccordion({
  type,
  status,
  startDate,
  endDate,
  lastContribution,
  formatDate,
  formatStatus,
  amountPerDay,
  interestRate,
  compoundingFrequency,
  lockPeriod,
  interestAccrued,
  earlyWithdrawalPenalty,
  currentBalance,
  estimatedEarnings,
  productDetails,
}: PackageDetailsAccordionProps) {
  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Accordion.Root type="single" collapsible className="mb-8">
      <Accordion.Item
        value="terms"
        className="mb-2 border rounded-lg overflow-hidden"
      >
        <Accordion.Trigger className="flex w-full justify-between items-center p-4 text-left font-medium text-gray-900 hover:bg-gray-50">
          <span>Terms and Conditions</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
        <Accordion.Content className="bg-white px-4 pb-4 pt-0 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="text-sm text-gray-600 space-y-2">
            <p>This package is subject to the following terms:</p>
            <ul className="list-disc pl-5 space-y-1">
              {type === 'Interest-Based' && (
                <>
                  <li>Lock period: {lockPeriod} days</li>
                  <li>Early withdrawal penalty: {earlyWithdrawalPenalty}%</li>
                  <li>Interest is compounded {compoundingFrequency}</li>
                </>
              )}
              {type === 'Daily Savings' && (
                <>
                  <li>
                    Daily contribution amount:{' '}
                    {formatCurrency(amountPerDay || 0)}
                  </li>
                  <li>Contributions are processed within 24 hours</li>
                  <li>Missed contributions may affect your savings goal</li>
                </>
              )}
              {type === 'SB Package' && (
                <>
                  <li>
                    Product price:{' '}
                    {formatCurrency(productDetails?.sellingPrice || 0)}
                  </li>
                  <li>Flexible contribution schedule</li>
                  <li>Product availability subject to stock</li>
                </>
              )}
              <li>Changes to the package terms require approval</li>
            </ul>
          </div>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item
        value="details"
        className="border rounded-lg overflow-hidden"
      >
        <Accordion.Trigger className="flex w-full justify-between items-center p-4 text-left font-medium text-gray-900 hover:bg-gray-50">
          <span>Package Details</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
        <Accordion.Content className="bg-white px-4 pb-4 pt-0 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Package Type</p>
                <p>{type}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <p>{formatStatus(status)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Start Date</p>
                <p>{formatDate(startDate)}</p>
              </div>
              {endDate && (
                <div>
                  <p className="font-medium text-gray-700">End Date</p>
                  <p>{formatDate(endDate)}</p>
                </div>
              )}
              {lastContribution && lastContribution !== 'Not available' && (
                <div>
                  <p className="font-medium text-gray-700">Last Contribution</p>
                  <p>{lastContribution}</p>
                </div>
              )}

              {/* Interest-Based Package specific details */}
              {type === 'Interest-Based' && (
                <>
                  <div>
                    <p className="font-medium text-gray-700">Interest Rate</p>
                    <p>{interestRate}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Compounding</p>
                    <p className="capitalize">{compoundingFrequency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Current Balance</p>
                    <p>{formatCurrency(currentBalance || 0)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Interest Earned</p>
                    <p className="text-green-600">
                      {formatCurrency(interestAccrued || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Est. Total Earnings
                    </p>
                    <p className="text-green-600">
                      {formatCurrency(estimatedEarnings || 0)}
                    </p>
                  </div>
                </>
              )}

              {/* Daily Savings specific details */}
              {type === 'Daily Savings' && amountPerDay && (
                <div>
                  <p className="font-medium text-gray-700">Daily Amount</p>
                  <p>{formatCurrency(amountPerDay)}</p>
                </div>
              )}

              {/* SB Package specific details */}
              {type === 'SB Package' && productDetails && (
                <>
                  <div>
                    <p className="font-medium text-gray-700">Product Name</p>
                    <p>{productDetails.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Description</p>
                    <p>{productDetails.description}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Price</p>
                    <p>{formatCurrency(productDetails.sellingPrice)}</p>
                  </div>
                  {productDetails.discount > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Discount</p>
                      <p className="text-green-600">
                        {formatCurrency(productDetails.discount)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
