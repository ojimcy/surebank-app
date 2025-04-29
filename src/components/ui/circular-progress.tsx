import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 10,
  showValue = true,
  color = '#0066A1',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;

  return (
    <div className={cn('relative', className)}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${value * 2.83} 283`}
          strokeDashoffset="0"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {showValue && (
          <text
            x={size / 2}
            y={size / 2 + 5}
            fontSize="20"
            textAnchor="middle"
            fill={color}
            fontWeight="bold"
          >
            {value}%
          </text>
        )}
      </svg>
    </div>
  );
}
