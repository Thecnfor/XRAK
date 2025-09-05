'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  children: React.ReactNode;
}

export default function LoadingScreen({ children }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isUnmounting, setIsUnmounting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 检查是否为首次访问
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (hasVisited) {
      setIsFirstVisit(false);
      setIsLoading(false);
      return;
    }

    // 标记已访问
    sessionStorage.setItem('hasVisited', 'true');

    // 模拟资源加载完成
    const timer = setTimeout(() => {
      // 开始卸载动画和内容显示
      setIsUnmounting(true);
      setShowContent(true);
      // 等待动画完成后隐藏加载屏幕
      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1秒动画时间
    }, 2000); // 2秒后开始卸载流程

    // 确保所有资源加载完成
    const handleLoad = () => {
      if (document.readyState === 'complete') {
        setTimeout(() => {
          setIsUnmounting(true);
          setShowContent(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }, 1000);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // 如果不是首次访问，直接渲染子组件
  if (!isFirstVisit) {
    return <>{children}</>;
  }

  return (
    <>
      {/* 加载屏幕 */}
      {isLoading && (
        <div className={`fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center transition-all duration-1000 ${
          isUnmounting 
            ? 'scale-0 blur-md opacity-0 transform-gpu' 
            : 'scale-100 blur-0 opacity-100'
        }`}>
          <div className={`w-full h-full flex items-center justify-center transition-all duration-1000 ${
            isUnmounting 
              ? 'scale-0 blur-md opacity-0 transform-gpu' 
              : 'scale-100 blur-0 opacity-100'
          }`}>
            <span className="loader"></span>
          </div>
        </div>
      )}
      {/* 主要内容 */}
      <div className={`transition-opacity duration-1000 ease-in-out ${
        showContent || !isFirstVisit ? 'opacity-100' : 'opacity-0'
      }`}>
        {children}
      </div>
    </>
  );
}