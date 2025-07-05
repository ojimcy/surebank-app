import React from 'react';
import { DSPackageData, PackageUtilities } from '../shared/types';
import { ProgressCircle } from '../shared/ProgressCircle';
import { PackageImage } from '../shared/PackageImage';
import { InfoGrid } from '../shared/InfoGrid';

interface DSPackageOverviewProps {
    packageData: DSPackageData;
    utilities: PackageUtilities;
}

export function DSPackageOverview({ packageData, utilities }: DSPackageOverviewProps) {
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
            label: 'Next Contribution',
            value: packageData.nextContribution || 'Not available',
            show: !!packageData.nextContribution && packageData.nextContribution !== 'Not available',
        },
        {
            label: 'Last Contribution',
            value: packageData.lastContribution || 'Not available',
            show: !!packageData.lastContribution && packageData.lastContribution !== 'Not available',
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="md:flex">
                <div className="md:w-1/3 h-48 bg-gray-200 overflow-hidden">
                    <PackageImage
                        src={packageData.productImage}
                        alt="Daily Savings Package"
                    />
                </div>
                <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Daily Savings Progress</h2>
                            <div className="flex items-center">
                                <div className="mr-4">
                                    <ProgressCircle
                                        progress={packageData.progress}
                                        color={packageData.color}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-500">Current Balance</div>
                                        <div className="font-bold text-xl">
                                            {formatCurrency(packageData.totalContribution)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Daily Amount</div>
                                        <div className="font-bold text-xl">
                                            {formatCurrency(packageData.amountPerDay)}
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