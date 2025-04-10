import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/dashboard/Dashboard';
import PackageList from '@/pages/packages/PackageList';
import NewPackage from '@/pages/packages/NewPackage';
import ProductCatalog from '@/pages/products/ProductCatalog';
import Settings from '@/pages/settings/Settings';
import Login from '@/pages/auth/Login';
import Deposit from '@/pages/payments/Deposit';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth-provider';
import { QueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/lib/toast-provider';
import { LoaderProvider } from '@/lib/loader-provider';
import { setupSafeArea } from '@/lib/safe-area';

function AppRoutes() {
  const location = useLocation();

  // Track page views and route changes
  useEffect(() => {
    // You could add analytics tracking here in the future
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/packages" element={<PackageList />} />
        <Route path="/packages/new" element={<NewPackage />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payments/deposit" element={<Deposit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
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
              <AppRoutes />
            </LoaderProvider>
          </ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
