export interface UserType {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  kycStatus?: 'verified' | 'pending' | string;
}

export interface SavingsPackage {
  id: number;
  title: string;
  type: string;
  icon: string;
  progress: number;
  current: number;
  amountPerDay: number;
  totalContribution: number;
  target: number;
  color: string;
}

export interface PackageType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  cta: string;
  path: string;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  category: string;
  amount: number;
  date: string;
  time: string;
}
