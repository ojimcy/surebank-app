import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
interface PackageActionsProps {
  type: 'Daily Savings' | 'Interest-Based' | 'SB Package';
  color: string;
  packageId?: string;
  onEditPackage: () => void;
  onClosePackage: () => void;
  onBuyProduct: () => void;
  onChangeProduct: () => void;
  hasMetTarget?: boolean;
}

export function PackageActions({
  type,
  color,
  packageId,
  onEditPackage,
  onBuyProduct,
  onChangeProduct,
  hasMetTarget = false,
}: PackageActionsProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      {type === 'SB Package' ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="flex items-center justify-center"
            style={{ backgroundColor: color }}
            onClick={
              hasMetTarget ? onBuyProduct : () => navigate('/payments/deposit')
            }
          >
            {hasMetTarget ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {hasMetTarget ? 'Buy Product' : 'Make Contribution'}
          </Button>
          <Button
            className="flex items-center justify-center"
            variant="outline"
            onClick={() => navigate('/packages/merge')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
              <path d="M15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
            Merge
          </Button>
          <Button
            className="flex items-center justify-center"
            variant="outline"
            onClick={onChangeProduct}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
              <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            Change Product
          </Button>
        </div>
      ) : type === 'Interest-Based' ? (
        // Interest-Based package specific actions
        <div className="grid grid-cols-1 gap-3">
          <Button
            className="flex items-center justify-center"
            style={{ backgroundColor: color }}
            onClick={() => navigate(`/packages/withdraw-interest${packageId ? `?packageId=${packageId}` : ''}`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
                clipRule="evenodd"
              />
            </svg>
            Withdraw
          </Button>
         
        </div>
      ) : (
        // Daily Savings package actions
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => {
              navigate('/payments/deposit');
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Make Contribution
          </Button>
          <Button
            className="flex items-center justify-center"
            variant="outline"
            onClick={() => navigate('/packages/withdraw')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
                clipRule="evenodd"
              />
            </svg>
            Withdraw
          </Button>
          <Button
            className="flex items-center justify-center col-span-2"
            variant="outline"
            onClick={onEditPackage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 102.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Package
          </Button>
        </div>
      )}
    </div>
  );
}
