import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { createLazyComponent } from '@/components/LazyRoute';

// Eagerly load critical components that are needed immediately
import Layout from '@/components/layout/Layout';
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/dashboard/Dashboard';

// Lazy load non-critical components
const PackageList = createLazyComponent(() => import('@/pages/packages/PackageList'), 'PackageList');
const PackageDetail = createLazyComponent(() => import('@/pages/packages/PackageDetail'), 'PackageDetail');
const NewPackage = createLazyComponent(() => import('@/pages/packages/NewPackage'), 'NewPackage');
const NewDailySavings = createLazyComponent(() => import('@/pages/packages/NewDailySavings'), 'NewDailySavings');
const NewSBPackage = createLazyComponent(() => import('@/pages/packages/NewSBPackage'), 'NewSBPackage');
const NewIBSPackage = createLazyComponent(() => import('@/pages/packages/NewIBSPackage'), 'NewIBSPackage');
const PackageSuccess = createLazyComponent(() => import('@/pages/packages/PackageSuccess'), 'PackageSuccess');
const ProductCatalog = createLazyComponent(() => import('@/pages/products/ProductCatalog'), 'ProductCatalog');
const ProductDetail = createLazyComponent(() => import('@/pages/products/ProductDetail'), 'ProductDetail');
const Settings = createLazyComponent(() => import('@/pages/settings/Settings'), 'Settings');
const Notifications = createLazyComponent(() => import('@/pages/settings/Notifications'), 'Notifications');
const PersonalInformation = createLazyComponent(() => import('@/pages/settings/PersonalInformation'), 'PersonalInformation');
const KycVerification = createLazyComponent(() => import('@/pages/settings/KycVerification'), 'KycVerification');
const KycBvnVerification = createLazyComponent(() => import('@/pages/settings/KycBvnVerification'), 'KycBvnVerification');
const KycSuccess = createLazyComponent(() => import('@/pages/settings/KycSuccess'), 'KycSuccess');
const Register = createLazyComponent(() => import('@/pages/auth/Register'), 'Register');
const Verify = createLazyComponent(() => import('@/pages/auth/Verify'), 'Verify');
const VerifyEmailPage = createLazyComponent(() => import('@/pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })), 'VerifyEmailPage');
const Deposit = createLazyComponent(() => import('@/pages/payments/Contribution'), 'Deposit');
const Withdraw = createLazyComponent(() => import('@/pages/payments/Withdraw'), 'Withdraw');
const WithdrawFromPackage = createLazyComponent(() => import('@/pages/packages/WithdrawFromPackage'), 'WithdrawFromPackage');
const WithdrawFromIBPackage = createLazyComponent(() => import('@/pages/packages/WithdrawFromIBPackage'), 'WithdrawFromIBPackage');
const MergePackages = createLazyComponent(() => import('@/pages/packages/MergePackages'), 'MergePackages');
const ChangeProduct = createLazyComponent(() => import('@/pages/packages/ChangeProduct'), 'ChangeProduct');
const PaymentSuccess = createLazyComponent(() => import('@/pages/payments/PaymentSuccess'), 'PaymentSuccess');
const PaymentError = createLazyComponent(() => import('@/pages/payments/PaymentError'), 'PaymentError');
const TransactionHistory = createLazyComponent(() => import('@/pages/payments/TransactionHistory'), 'TransactionHistory');
const TransactionDetails = createLazyComponent(() => import('@/pages/payments/TransactionDetails'), 'TransactionDetails');
const Checkout = createLazyComponent(() => import('@/pages/checkout/Checkout'), 'Checkout');
const OrderDetails = createLazyComponent(() => import('@/pages/orders/OrderDetails'), 'OrderDetails');
const Orders = createLazyComponent(() => import('@/pages/orders/Orders'), 'Orders');
const ForgotPassword = createLazyComponent(() => import('@/pages/auth/ForgotPassword'), 'ForgotPassword');
const VerifyResetCode = createLazyComponent(() => import('@/pages/auth/VerifyResetCode'), 'VerifyResetCode');
const ResetPassword = createLazyComponent(() => import('@/pages/auth/ResetPassword'), 'ResetPassword');
const PinLock = createLazyComponent(() => import('@/pages/auth/PinLock'), 'PinLock');
const SetupPin = createLazyComponent(() => import('@/pages/settings/SetupPin'), 'SetupPin');
const PinSettings = createLazyComponent(() => import('@/pages/settings/PinSettings'), 'PinSettings');
const AccountDetail = createLazyComponent(() => import('@/pages/dashboard/AccountDetail'), 'AccountDetail');
const ManageBankAccounts = createLazyComponent(() => import('@/pages/settings/ManageBankAccounts'), 'ManageBankAccounts');
const CardsList = createLazyComponent(() => import('@/pages/cards/CardsList'), 'CardsList');
const AddCard = createLazyComponent(() => import('@/pages/cards/AddCard'), 'AddCard');
const CardDetail = createLazyComponent(() => import('@/pages/cards/CardDetail'), 'CardDetail');
const SchedulesList = createLazyComponent(() => import('@/pages/schedules/SchedulesList'), 'SchedulesList');
const CreateSchedule = createLazyComponent(() => import('@/pages/schedules/CreateSchedule'), 'CreateSchedule');
const ScheduleDetail = createLazyComponent(() => import('@/pages/schedules/ScheduleDetail'), 'ScheduleDetail');
const EditSchedule = createLazyComponent(() => import('@/pages/schedules/EditSchedule'), 'EditSchedule');
const PaymentActivity = createLazyComponent(() => import('@/pages/schedules/PaymentActivity'), 'PaymentActivity');
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth-provider';
import { PinProvider } from '@/lib/pin-provider';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/lib/toast-provider';
import { LoaderProvider } from '@/lib/loader-provider';
import { setupSafeArea } from '@/lib/safe-area';
import AuthGuard from '@/components/auth/AuthGuard';
import PinGuard from '@/components/auth/PinGuard';
import { UrlHandler } from '@/lib/services/url-handler';
import { deepLinkingService } from '@/lib/services/deep-linking';
import { pushNotificationService } from '@/lib/services/push-notifications';
import { crashReportingService } from '@/lib/services/crash-reporting';
import { analyticsService } from '@/lib/services/analytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Auth routes don't need the main layout
function AuthRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/verify" element={<Verify />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
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
            <Route path="/packages/withdraw-interest" element={<WithdrawFromIBPackage />} />
            <Route path="/packages/merge" element={<MergePackages />} />
            <Route path="/packages/change-product" element={<ChangeProduct />} />
            <Route path="/products" element={<ProductCatalog />} />
            <Route path="/products/:productId/:packageId" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/accounts/:accountType" element={<AccountDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/setup-pin" element={<SetupPin />} />
            <Route path="/settings/pin-settings" element={<PinSettings />} />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/personal-information" element={<PersonalInformation />} />
            <Route path="/settings/manage-bank-accounts" element={<ManageBankAccounts />} />
            <Route path="/settings/kyc" element={<KycVerification />} />
            <Route path="/settings/kyc/bvn" element={<KycBvnVerification />} />
            <Route path="/settings/kyc/id" element={<KycVerification />} />
            <Route path="/settings/kyc/success" element={<KycSuccess />} />
            <Route path="/payments/deposit" element={<Deposit />} />
            <Route path="/payments/withdraw" element={<Withdraw />} />
            <Route path="/payments/success" element={<PaymentSuccess />} />
            <Route path="/payments/error" element={<PaymentError />} />
            <Route path="/payments/history" element={<TransactionHistory />} />
            <Route path="/payments/transaction/:transactionId" element={<TransactionDetails />} />
            <Route path="/cards" element={<CardsList />} />
            <Route path="/cards/add" element={<AddCard />} />
            <Route path="/cards/:id" element={<CardDetail />} />
            <Route path="/schedules" element={<SchedulesList />} />
            <Route path="/schedules/create" element={<CreateSchedule />} />
            <Route path="/schedules/activity" element={<PaymentActivity />} />
            <Route path="/schedules/:id" element={<ScheduleDetail />} />
            <Route path="/schedules/:id/edit" element={<EditSchedule />} />
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

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        // Initialize crash reporting first
        await crashReportingService.initialize({
          enableCrashlyticsCollection: true,
        });

        // Initialize analytics
        await analyticsService.initialize({
          enableAnalyticsCollection: true,
          sessionTimeoutDuration: 30 * 60 * 1000, // 30 minutes
        });

        // Initialize deep linking
        deepLinkingService.initialize();
        
        // Keep the old URL handler for backward compatibility
        UrlHandler.initialize();
        
        // Initialize push notifications (will be handled by auth context when user is logged in)
        // pushNotificationService.initialize(); // This will be called when user is authenticated
        
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    // Order matters - innermost context is first
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
