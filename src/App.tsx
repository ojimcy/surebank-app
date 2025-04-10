import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/dashboard/Dashboard';
import PackageList from '@/pages/packages/PackageList';
import NewPackage from '@/pages/packages/NewPackage';
import ProductCatalog from '@/pages/products/ProductCatalog';
import Settings from '@/pages/settings/Settings';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Verify from '@/pages/auth/Verify';
import Deposit from '@/pages/payments/Deposit';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyResetCode from '@/pages/auth/VerifyResetCode';
import ResetPassword from '@/pages/auth/ResetPassword';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth-provider';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/lib/toast-provider';
import { LoaderProvider } from '@/lib/loader-provider';
import { setupSafeArea } from '@/lib/safe-area';
import { useAuth } from '@/lib/auth-provider';

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
  const { isAuthenticated } = useAuth();

  // Track page views and route changes
  useEffect(() => {
    // You could add analytics tracking here in the future
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/packages" element={<PackageList />} />
        <Route path="/packages/new" element={<NewPackage />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payments/deposit" element={<Deposit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

// Main router that decides between auth and app routes
function MainRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if current route is an auth route
  const isAuthRoute =
    location.pathname.startsWith('/auth/') || location.pathname === '/login';

  // Show auth routes if on auth path or not authenticated
  if (isAuthRoute && !isAuthenticated) {
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
      <AuthProvider>
        <QueryProvider>
          <ToastProvider>
            <LoaderProvider>
              <MainRoutes />
            </LoaderProvider>
          </ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
