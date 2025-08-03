interface PackageHeaderProps {
  title: string;
  type: string;
  status: string;
  statusColor: string;
  color: string;
  accountNumber?: string;
}

export function PackageHeader({
  title,
  type,
  status,
  statusColor,
  color,
  accountNumber,
}: PackageHeaderProps) {

  return (
    <>
      
      {/* Package Title and Type */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center mt-1 gap-2">
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {type}
            </span>
            {accountNumber && (
              <span className="text-xs text-gray-500">
                Acc: {accountNumber}
              </span>
            )}
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
