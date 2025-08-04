import { useNavigate } from 'react-router-dom';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface NestedHeaderProps {
  title: string;
  onBack?: () => void;
}

function NestedHeader({ title, onBack }: NestedHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-gray-200 py-4 px-6',
        safeAreaClasses.paddingTop,
        safeAreaClasses.paddingX
      )}
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`,
        paddingLeft: `env(safe-area-inset-left, 0px)`,
        paddingRight: `calc(0.5rem + env(safe-area-inset-right, 0px))`
      }}
    >
      <div className="container mx-auto flex items-center relative">
        {/* Back button - positioned on the left */}
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>

        {/* Title - centered */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>
    </header>
  );
}

export default NestedHeader;