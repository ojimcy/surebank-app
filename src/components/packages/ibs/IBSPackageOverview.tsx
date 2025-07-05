import { IBSPackageData, PackageUtilities } from '../shared/types';
import { ProgressCircle } from '../shared/ProgressCircle';
import { PackageImage } from '../shared/PackageImage';
import { InfoGrid } from '../shared/InfoGrid';

interface IBSPackageOverviewProps {
    packageData: IBSPackageData;
    utilities: PackageUtilities;
}

export function IBSPackageOverview({ packageData, utilities }: IBSPackageOverviewProps) {
    const { formatCurrency, formatDate } = utilities;



    // Safety check for numeric values
    const safeFormatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null || isNaN(value)) {
            return formatCurrency(0);
        }
        return formatCurrency(Math.max(0, value)); // Ensure non-negative values
    };

    // Calculate days remaining to maturity
    const getDaysToMaturity = () => {
        try {
            const maturityDate = new Date(packageData.maturityDate);
            const today = new Date();

            // Check if maturity date is valid
            if (isNaN(maturityDate.getTime())) {
                return 0;
            }

            const diffTime = maturityDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        } catch {
            return 0;
        }
    };

    const daysToMaturity = getDaysToMaturity();

    const infoItems = [
        {
            label: 'Start Date',
            value: formatDate(packageData.startDate),
        },
        {
            label: 'Maturity Date',
            value: formatDate(packageData.maturityDate),
        },
        {
            label: 'Interest Rate',
            value: packageData.interestRate,
        },
        {
            label: 'Lock Period',
            value: `${packageData.lockPeriod} days`,
        },
        {
            label: 'Days to Maturity',
            value: daysToMaturity > 0 ? `${daysToMaturity} days` : 'Matured',
            show: true,
        },
        {
            label: 'Compounding',
            value: packageData.compoundingFrequency || 'Simple Interest',
            show: !!packageData.compoundingFrequency,
        },
    ];
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="md:flex">
                <div className="md:w-1/3 h-48 bg-gray-200 overflow-hidden">
                    <PackageImage
                        src={packageData.productImage}
                        alt="Interest-Based Savings Package"
                        fallbackSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    />
                </div>
                <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Interest Savings Progress</h2>
                            <div className="flex items-center">
                                <div className="mr-4">
                                    <ProgressCircle
                                        progress={Math.min(100, Math.max(0, packageData.progress || 0))}
                                        color={packageData.color}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-500">Current Balance</div>
                                        <div className="font-bold text-xl">
                                            {safeFormatCurrency(packageData.current)}
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-500">Principal Amount</div>
                                        <div className="font-bold text-xl">
                                            {safeFormatCurrency(packageData.principalAmount)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Accrued Interest</div>
                                        <div className="font-bold text-xl text-green-600">
                                            +{safeFormatCurrency(packageData.accruedInterest)}
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