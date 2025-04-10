import React, { createContext, useContext, useState } from 'react';
import { Loader } from '@/components/ui/loader';

interface LoaderContextType {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | undefined>(undefined);

  const showLoader = (loadingText?: string) => {
    setText(loadingText);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
    setText(undefined);
  };

  return (
    <LoaderContext.Provider
      value={{ showLoader, hideLoader, isLoading: loading }}
    >
      {children}
      {loading && <Loader fullScreen text={text} />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);

  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }

  return context;
}
