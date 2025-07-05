import React from 'react';
import { SBPackageData, PackageUtilities } from '../shared/types';
import { ProgressCircle } from '../shared/ProgressCircle';
import { PackageImage } from '../shared/PackageImage';
import { InfoGrid } from '../shared/InfoGrid';

interface SBPackageOverviewProps {
    packageData: SBPackageData;
    utilities: PackageUtilities;
}

export function SBPackageOverview({ packageData, utilities }: SBPackageOverviewProps) {
    const { formatCurrency, formatDate } = utilities;

    const infoItems = [
        {
            label: 'Start Date',
            value: formatDate(packageData.startDate),
        },
        {
            label: 'End Date',
            value: packageData.endDate ? formatDate(packageData.endDate) : 'Not set',
            show: true,
        },
        {
            label: 'Product Name',
            value: packageData.productName || 'Product Package',
            show: !!packageData.productName,
        },
        {
            label: 'Product Price',
            value: packageData.productPrice ? formatCurrency(packageData.productPrice) : formatCurrency(packageData.target),
            show: true,
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="md:flex">
                <div className="md:w-1/3 h-48 bg-gray-200 overflow-hidden">
                    <PackageImage
                        src={packageData.productImage}
                        alt={packageData.productName || 'Product Package'}
                        fallbackSrc="https://images.unsplash.com/photo-1607863680198-23d4b2565a5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    />
                </div>
                <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Product Savings Progress</h2>
                            <div className="flex items-center">
                                <div className="mr-4">
                                    <ProgressCircle
                                        progress={packageData.progress}
                                        color={packageData.color}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-500">Current Savings</div>
                                        <div className="font-bold text-xl">
                                            {formatCurrency(packageData.totalContribution)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Target Amount</div>
                                        <div className="font-bold text-xl">
                                            {formatCurrency(packageData.target)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <InfoGrid items={infoItems} />
                    </div>
                </div>
            </div>
        </div>
    );
} 