import { ACCOUNT_TYPE_DISPLAY } from '@/lib/api/accounts';
import { useState, useEffect } from 'react';

interface SelectAccountTypeProps {
  onSelect: (accountType: 'ds' | 'sb' | 'ibs') => void;
  onCancel: () => void;
  isLoading: boolean;
  preselectedType?: 'ds' | 'sb' | 'ibs' | null;
}

export function SelectAccountType({
  onSelect,
  onCancel,
  isLoading = false,
  preselectedType = null,
}: SelectAccountTypeProps) {
  const [selectedType, setSelectedType] = useState<'ds' | 'sb' | 'ibs' | null>(
    preselectedType
  );

  useEffect(() => {
    if (preselectedType) {
      setSelectedType(preselectedType);
    }
  }, [preselectedType]);

  const accountTypes: Array<{
    id: 'ds' | 'sb' | 'ibs';
    name: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      id: 'ds',
      name: ACCOUNT_TYPE_DISPLAY.ds,
      description:
        'Save regularly with flexible daily, weekly, or monthly deposits',
      icon: 'calendar',
      color: '#0066A1',
    },
    {
      id: 'sb',
      name: ACCOUNT_TYPE_DISPLAY.sb,
      description: 'Save towards specific goals with SureBank packages',
      icon: 'target',
      color: '#7952B3',
    },
    {
      id: 'ibs',
      name: ACCOUNT_TYPE_DISPLAY.ibs,
      description: 'Earn competitive interest rates on your locked savings',
      icon: 'trending-up',
      color: '#28A745',
    },
  ];

  const handleSelect = (type: 'ds' | 'sb' | 'ibs') => {
    if (isLoading) return;
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'target':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'trending-up':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0066A1] to-[#0088CC] text-white p-6">
          <h2 className="text-2xl font-semibold mb-2">Select Account Type</h2>
          <p className="text-white/80">
            Choose the type of account you want to create. You can have multiple
            accounts of different types.
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            {accountTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                disabled={isLoading}
                className={`w-full flex items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                  selectedType === type.id
                    ? `border-[${type.color}] bg-[${type.color}]/10`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`}
              >
                <div
                  className={`mr-4 p-3 rounded-full ${
                    selectedType === type.id
                      ? `bg-[${type.color}] text-white`
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={
                    selectedType === type.id
                      ? { backgroundColor: type.color }
                      : {}
                  }
                >
                  <div className="w-6 h-6">{renderIcon(type.icon)}</div>
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-800 block">
                    {type.name}
                  </span>
                  <span className="text-sm text-gray-600 block mt-1">
                    {type.description}
                  </span>
                </div>
                {selectedType === type.id && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white absolute right-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !selectedType}
              className="px-6 py-2 bg-[#0066A1] text-white rounded-md hover:bg-[#00558C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
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
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
