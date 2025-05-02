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
}

export function PackageDetailsAccordion({
  type,
  status,
  startDate,
  endDate,
  lastContribution,
  formatDate,
  formatStatus,
}: PackageDetailsAccordionProps) {
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
              <li>Early withdrawal penalties may apply.</li>
              <li>Contributions are processed within 24 hours.</li>
              <li>Target dates are flexible and can be extended.</li>
              <li>Changes to the package terms require approval.</li>
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
            </div>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
