import React, { createContext, useContext, useEffect, useState } from 'react';
import storage from './api/storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = 'theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme on initial render
  useEffect(() => {
    const loadTheme = async () => {
      // Check for saved theme preference
      const savedTheme = await storage.getItem(THEME_KEY) as Theme | null;

      // Check for system preference if no saved theme
      if (!savedTheme && typeof window !== 'undefined') {
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
        setTheme(systemPreference);
      } else if (savedTheme) {
        setTheme(savedTheme);
      }
      
      setIsLoaded(true);
    };

    loadTheme();
  }, []);

  // Update theme class on the document element
  useEffect(() => {
    if (!isLoaded) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save theme preference
    storage.setItem(THEME_KEY, theme);
  }, [theme, isLoaded]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: (newTheme: Theme) => {
        setTheme(newTheme);
      }
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
