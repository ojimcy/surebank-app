import React from 'react';

interface ProgressCircleProps {
    progress: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}

export function ProgressCircle({
    progress,
    color,
    size = 80,
    strokeWidth = 10
}: ProgressCircleProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                className="w-full h-full transform -rotate-90"
                viewBox={`0 0 ${size} ${size}`}
            >
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
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="0"
                    className="transition-all duration-300 ease-in-out"
                />
            </svg>
            {/* Progress text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="text-lg font-bold"
                    style={{ color }}
                >
                    {progress}%
                </span>
            </div>
        </div>
    );
} 