import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type AnnouncementCardProps = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta?: {
    text: string;
    onClick: () => void;
  };
  link?: string;
  onDismiss: (id: string) => void;
};

export function AnnouncementCard({
  id,
  title,
  description,
  icon,
  cta,
  link,
  onDismiss,
}: AnnouncementCardProps) {
  // Get button text from either source
  const buttonText = cta?.text || 'Learn More';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow">
        <h3 className="font-semibold text-blue-800">{title}</h3>
        <p className="text-sm text-blue-700">{description}</p>

        {/* If link is provided, use Link component */}
        {link ? (
          <Link to={link} className="inline-block mt-1">
            <Button
              variant="link"
              className="p-0 h-auto text-blue-800 font-semibold"
            >
              {buttonText}
            </Button>
          </Link>
        ) : cta ? (
          /* Otherwise use onClick handler if cta is provided */
          <Button
            variant="link"
            className="p-0 h-auto mt-1 text-blue-800 font-semibold"
            onClick={cta.onClick}
          >
            {cta.text}
          </Button>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-6 w-6 text-blue-600 hover:bg-blue-100"
        onClick={() => onDismiss(id)}
      >
        <X size={16} />
      </Button>
    </div>
  );
} 