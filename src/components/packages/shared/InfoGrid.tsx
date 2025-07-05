import React from 'react';

interface InfoItem {
    label: string;
    value: string;
    show?: boolean;
}

interface InfoGridProps {
    items: InfoItem[];
    className?: string;
}

export function InfoGrid({ items, className = "grid grid-cols-2 gap-4" }: InfoGridProps) {
    const visibleItems = items.filter(item => item.show !== false);

    return (
        <div className={className}>
            {visibleItems.map((item, index) => (
                <div key={index}>
                    <div className="text-sm text-gray-500">{item.label}</div>
                    <div className="font-medium">{item.value}</div>
                </div>
            ))}
        </div>
    );
} 