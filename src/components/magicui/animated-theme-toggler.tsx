"use client";

import { Moon, SunDim } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

type props = {
  className?: string;
};

// 主题管理工具函数
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  
  // 如果没有保存的主题，检测系统偏好
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
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

export const AnimatedThemeToggler = ({ className }: props) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // 初始化主题状态
  useEffect(() => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    setIsDarkMode(initialTheme);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在没有手动设置主题时才响应系统变化
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        applyTheme(e.matches);
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const newTheme = !isDarkMode;

    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
      // 降级处理：直接切换主题
      applyTheme(newTheme);
      setIsDarkMode(newTheme);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        applyTheme(newTheme);
        setIsDarkMode(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 400,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  return (
    <button 
      ref={buttonRef} 
      onClick={changeTheme} 
      className={cn(
        "text-[var(--color-btn)] hover:text-[var(--color-text)] transition-colors duration-400 p-1 rounded-md active:scale-95 transform transition-transform cursor-pointer",
        className
      )}
      aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
    >
      <span className="sr-only">
        {isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
      </span>
      {isDarkMode ? (
        <SunDim size={20} className="transition-transform duration-200" />
      ) : (
        <Moon size={20} className="transition-transform duration-200" />
      )}
    </button>
  );
};
