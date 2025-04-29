import { useNavigate } from 'react-router-dom';

interface PackageHeaderProps {
  title: string;
  type: string;
  accountNumber: string;
  status: string;
  statusColor: string;
  color: string;
}

export function PackageHeader({
  title,
  type,
  accountNumber,
  status,
  statusColor,
  color,
}: PackageHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/packages')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
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
          Back
        </button>
      </div>

      {/* Package Title and Type */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center mt-1">
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {type}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Account: {accountNumber}
            </span>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor} text-white`}
        >
          {status}
        </div>
      </div>
    </>
  );
}
