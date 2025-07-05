// Shared types for package components
export interface BasePackageData {
    id: string;
    title: string;
    accountNumber: string;
    status: string;
    statusColor: string;
    color: string;
    startDate: string;
    endDate?: string;
    productImage?: string;
    totalContribution: number;
    progress: number;
    current: number;
    target: number;
}

export interface DSPackageData extends BasePackageData {
    type: 'Daily Savings';
    amountPerDay: number;
    nextContribution?: string;
    lastContribution?: string;
}

export interface SBPackageData extends BasePackageData {
    type: 'SB Package';
    productName?: string;
    productPrice?: number;
}

export interface IBSPackageData extends BasePackageData {
    type: 'Interest-Based';
    interestRate: string;
    maturityDate: string;
    accruedInterest: number;
    principalAmount: number;
    lockPeriod: number;
    compoundingFrequency?: string;
    daysToMaturity?: number;
}

export type PackageData = DSPackageData | SBPackageData | IBSPackageData;

// Shared utility functions
export interface PackageUtilities {
    formatCurrency: (amount: number) => string;
    formatDate: (date: string) => string;
    formatStatus: (status: string) => string;
}

// Common action handlers
export interface BasePackageActions {
    onWithdraw: () => void;
    onClosePackage: () => void;
}

export interface DSPackageActions extends BasePackageActions {
    onAddContribution: () => void;
    onEditPackage: () => void;
}

export interface SBPackageActions extends BasePackageActions {
    onBuyProduct: () => void;
    onMerge: () => void;
    onChangeProduct: () => void;
}

export interface IBSPackageActions extends BasePackageActions {
    onViewProjections: () => void;
    onEarlyWithdraw: () => void;
}

// Contribution interface for timeline
export interface Contribution {
    id: string;
    amount: number;
    date: string;
    status: string;
} 