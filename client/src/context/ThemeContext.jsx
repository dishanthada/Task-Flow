import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { updateTheme as updateThemeApi } from '../api/authApi';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

const THEME_KEY = 'taskflow_theme';

export const ThemeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Persist to backend if user is logged in
    if (isAuthenticated) {
      try {
        await updateThemeApi(newTheme);
      } catch {
        // Non-critical: theme toggle still works locally
      }
    }
  }, [theme, isAuthenticated]);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
