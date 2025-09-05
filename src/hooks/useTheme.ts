'use client';

import { useThemeContext } from '@/components/providers/ThemeProvider';

/**
 * 自定义Hook，用于获取当前的主题状态
 * @returns 当前主题状态（是否为深色模式）
 */
export const useTheme = (): boolean => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode;
};

/**
 * 自定义Hook，用于获取和切换主题状态
 * @returns 包含主题状态和切换方法的对象
 */
export const useThemeWithToggle = () => {
  return useThemeContext();
};