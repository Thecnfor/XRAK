'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// 主题管理工具函数
export const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  
  // 如果没有保存的主题，检测系统偏好
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  
  // 保存到localStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 初始化主题状态
  useEffect(() => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    setIsDarkMode(initialTheme);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    applyTheme(newTheme);
    setIsDarkMode(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义Hook，用于获取和切换主题
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};