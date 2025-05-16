import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/dashboard/Dashboard';
import PackageList from '@/pages/packages/PackageList';
import PackageDetail from '@/pages/packages/PackageDetail';
import NewPackage from '@/pages/packages/NewPackage';
import NewDailySavings from '@/pages/packages/NewDailySavings';
import NewSBPackage from '@/pages/packages/NewSBPackage';
import NewIBSPackage from '@/pages/packages/NewIBSPackage';
import PackageSuccess from '@/pages/packages/PackageSuccess';
import ProductCatalog from '@/pages/products/ProductCatalog';
import ProductDetail from '@/pages/products/ProductDetail';
import Settings from '@/pages/settings/Settings';
import Notifications from '@/pages/settings/Notifications';
import PersonalInformation from '@/pages/settings/PersonalInformation';
import KycVerification from '@/pages/settings/KycVerification';
import KycBvnVerification from '@/pages/settings/KycBvnVerification';
import KycIdVerification from '@/pages/settings/KycIdVerification';
import KycSuccess from '@/pages/settings/KycSuccess';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Verify from '@/pages/auth/Verify';
import Deposit from '@/pages/payments/Contribution';
import Withdraw from '@/pages/payments/Withdraw';
import WithdrawFromPackage from '@/pages/packages/WithdrawFromPackage';
import MergePackages from '@/pages/packages/MergePackages';
import ChangeProduct from '@/pages/packages/ChangeProduct';
import PaymentSuccess from '@/pages/payments/PaymentSuccess';
import PaymentError from '@/pages/payments/PaymentError';
import TransactionHistory from '@/pages/payments/TransactionHistory';
import Checkout from '@/pages/checkout/Checkout';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyResetCode from '@/pages/auth/VerifyResetCode';
import ResetPassword from '@/pages/auth/ResetPassword';
import PinLock from '@/pages/auth/PinLock';
import SetupPin from '@/pages/settings/SetupPin';
import PinSettings from '@/pages/settings/PinSettings';
import AccountDetail from '@/pages/dashboard/AccountDetail';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth-provider';
import { PinProvider } from '@/lib/pin-provider';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/lib/toast-provider';
import { LoaderProvider } from '@/lib/loader-provider';
import { setupSafeArea } from '@/lib/safe-area';
import AuthGuard from '@/components/auth/AuthGuard';
import PinGuard from '@/components/auth/PinGuard';

// Auth routes don't need the main layout
function AuthRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/verify" element={<Verify />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/verify-reset-code" element={<VerifyResetCode />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

// App routes with the main layout
function AppRoutes() {
  const location = useLocation();

  // Track page views and route changes
  useEffect(() => {
    // You could add analytics tracking here in the future
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthGuard>
      <PinGuard>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/packages" element={<PackageList />} />
            <Route path="/packages/new" element={<NewPackage />} />
            <Route path="/packages/new/daily" element={<NewDailySavings />} />
            <Route path="/packages/new/sb" element={<NewSBPackage />} />
            <Route path="/packages/new/ibs" element={<NewIBSPackage />} />
            <Route path="/packages/new/success" element={<PackageSuccess />} />
            <Route path="/packages/new/ibs-error" element={<PaymentError />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/packages/withdraw" element={<WithdrawFromPackage />} />
            <Route path="/packages/merge" element={<MergePackages />} />
            <Route path="/packages/change-product" element={<ChangeProduct />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/products/:productId/:packageId" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/accounts/:accountType" element={<AccountDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/setup-pin" element={<SetupPin />} />
            <Route path="/settings/pin-settings" element={<PinSettings />} />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/personal-information" element={<PersonalInformation />} />
            <Route path="/settings/kyc" element={<KycVerification />} />
            <Route path="/settings/kyc/bvn" element={<KycBvnVerification />} />
            <Route path="/settings/kyc/id" element={<KycIdVerification />} />
            <Route path="/settings/kyc/success" element={<KycSuccess />} />
            <Route path="/payments/deposit" element={<Deposit />} />
            <Route path="/payments/withdraw" element={<Withdraw />} />
            <Route path="/payments/success" element={<PaymentSuccess />} />
            <Route path="/payments/error" element={<PaymentError />} />
            <Route path="/payments/history" element={<TransactionHistory />} />
            <Route path="/pin-lock" element={<PinLock />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </PinGuard>
    </AuthGuard>
  );
}

// Main router that decides between auth and app routes
function MainRoutes() {
  const location = useLocation();

  // Check if current route is an auth route
  const isAuthRoute =
    location.pathname.startsWith('/auth/') || location.pathname === '/login';

  // Show auth routes if on auth path, otherwise show protected app routes
  if (isAuthRoute) {
    return <AuthRoutes />;
  }

  // Show app routes otherwise
  return <AppRoutes />;
}

function App() {
  // Initialize safe area handling
  useEffect(() => {
    const cleanup = setupSafeArea();

    return () => {
      cleanup();
    };
  }, []);

  return (
    // Order matters - innermost context is first
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <PinProvider>
              <LoaderProvider>
                <MainRoutes />
              </LoaderProvider>
            </PinProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
