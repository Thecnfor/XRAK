"use client";

import { Moon, SunDim } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/components/providers/ThemeProvider";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { isDarkMode, toggleTheme } = useThemeContext();

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
      // 降级处理：直接切换主题
      toggleTheme();
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
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
