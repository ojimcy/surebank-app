import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-h-screen bg-[--background] transition-colors duration-300',
        safeAreaClasses.paddingLeft,
        safeAreaClasses.paddingRight
      )}
    >
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-28 overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
