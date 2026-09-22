import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, Theme } from '../theme/theme';

type UserInfo = {
  name: string;
  phone: string;
};

type AppContextValue = {
  user: UserInfo | null;
  isDarkMode: boolean;
  theme: Theme;
  isLoading: boolean;
  saveUser: (user: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
};

const USER_KEY = 'recyclingapp.user';
const DARK_MODE_KEY = 'recyclingapp.darkMode';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedDarkMode] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(DARK_MODE_KEY),
        ]);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedDarkMode) setIsDarkMode(storedDarkMode === 'true');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveUser = async (newUser: UserInfo) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const setDarkMode = async (value: boolean) => {
    await AsyncStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
    setIsDarkMode(value);
  };

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const value: AppContextValue = {
    user,
    isDarkMode,
    theme,
    isLoading,
    saveUser,
    logout,
    setDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
