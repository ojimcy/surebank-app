interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface ContributionTimelineProps {
  contributions: Contribution[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  formatStatus: (status: string) => string;
}

export function ContributionTimeline({
  contributions,
  formatCurrency,
  formatDate,
  formatStatus,
}: ContributionTimelineProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No contributions found for this package.
      </div>
    );
  }
console.log("ContributionTimeline component loaded", contributions);

  return (
    <div className="space-y-4">
      {contributions.map((contribution, index) => (
        <div
          key={contribution.id}
          className="relative flex items-start pl-8 pb-4"
        >
          {/* Timeline line */}
          {index < contributions.length - 1 && (
            <div className="absolute left-4 top-4 w-0.5 h-full bg-gray-200"></div>
          )}

          {/* Timeline dot */}
          <div
            className={`absolute left-3 top-2 w-2.5 h-2.5 rounded-full ${
              contribution.status === 'completed'
                ? 'bg-green-500'
                : 'bg-yellow-500'
            }`}
          ></div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">
                  {formatCurrency(contribution.amount)}
                </span>
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    contribution.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {formatStatus(contribution.status)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(contribution.date)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
