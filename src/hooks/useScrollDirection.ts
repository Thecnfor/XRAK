'use client'

import { useState, useEffect } from 'react';

export const useScrollDirection = (threshold: number = 0) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > threshold) {
        setScrollDirection(direction);
        
        // 当向下滚动超过header高度时隐藏，向上滚动时显示
        if (direction === 'down' && scrollY > 60) { // 60px 大约是header高度
          setIsVisible(false);
        } else if (direction === 'up') {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(scrollY > 0 ? scrollY : 0);
    };

    const handleScroll = () => {
      requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection, lastScrollY, threshold]);

  return { scrollDirection, isVisible, lastScrollY };
};