import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Define nested routes that should hide the main header
  const nestedRoutes = [
    // Package nested screens
    '/packages/new',
    '/packages/new/daily',
    '/packages/new/sb',
    '/packages/new/ibs',
    '/packages/new/success',
    '/packages/withdraw',
    '/packages/withdraw-interest',
    '/packages/merge',
    '/packages/change-product',
    // Product screens
    '/products/:productId/:packageId',
    // Order screens
    '/orders/:orderId',
    // Checkout
    '/checkout',
    // Payment screens
    '/payments/deposit',
    '/payments/withdraw',
    '/payments/success',
    '/payments/error',
    '/payments/transaction/:transactionId',
    // Settings nested screens
    '/settings/notifications',
    '/settings/personal-information',
    '/settings/manage-bank-accounts',
    '/settings/kyc',
    '/settings/kyc/bvn',
    '/settings/kyc/id',
    '/settings/kyc/success',
    '/settings/setup-pin',
    '/settings/pin-settings',
    // Card screens
    '/cards',
    '/cards/add',
    '/cards/:id',
    // Schedule screens
    '/schedules',
    '/schedules/create',
    '/schedules/activity',
    '/schedules/:id',
    '/schedules/:id/edit',
    // Account detail
    '/accounts/:accountType'
  ];
  
  // Also check for dynamic routes with parameters
  const isNestedRoute = nestedRoutes.some(route => {
    if (route.includes(':')) {
      // Convert route pattern to regex
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(location.pathname);
    }
    return location.pathname === route || location.pathname.startsWith(route + '/');
  });
  
  // Also check for package detail routes (/packages/:id)
  const isPackageDetail = /^\/packages\/[^/]+$/.test(location.pathname) && location.pathname !== '/packages/new';
  
  const shouldHideHeader = isNestedRoute || isPackageDetail;
  
  return (
    <div className="flex flex-col min-h-screen bg-[--background] transition-colors duration-300">
      {!shouldHideHeader && <Header />}
      <main className="flex-1 container mx-auto px-4 py-6 pb-28 overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
