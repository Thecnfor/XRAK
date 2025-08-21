'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCacheConfig } from '@/config/isr-config';

interface ContentCardData {
  title: string;
  category: string;
  publishDate: string;
  content?: string;
  href?: string;
  imagePath?: string;
  id?: string;
  lastUpdated?: string;
}

interface ContentCardProps {
  data: ContentCardData;
  variant: 'recommend' | 'news' | 'project';
  className?: string;
  href?: string;
  isLoading?: boolean;
  onError?: (error: Error) => void;
  enableISR?: boolean;
  cacheKey?: string;
}

interface CacheStatus {
  isStale: boolean;
  lastFetch: Date | null;
  retryCount: number;
}

// 加载状态组件
const LoadingCard: React.FC<{ variant: 'recommend' | 'news' | 'project'; className?: string }> = ({ variant, className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg';
  
  if (variant === 'recommend') {
    return (
      <div className={`pt-10 ${className}`}>
        <div className={`aspect-[1/1] min-h-[4rem] ${baseClasses}`} />
        <div className="pt-1">
          <div className={`h-6 ${baseClasses} my-3`} />
          <div className={`h-4 w-3/4 ${baseClasses}`} />
        </div>
      </div>
    ); 
  }
  
  if (variant === 'news') {
    return (
      <div className={`w-full h-full flex items-center justify-start ${className}`}>
        <div className={`aspect-[1/1] h-full ${baseClasses}`} />
        <div className="pl-8 flex-1">
          <div className={`h-6 ${baseClasses} mb-4`} />
          <div className={`h-4 w-2/3 ${baseClasses}`} />
        </div>
      </div>
    );
  }
  
  if (variant === 'project') {
    return (
      <div className={`border border-gray-200 dark:border-zinc-800 rounded-lg p-6 ${className}`}>
        <div className={`aspect-[1/1] min-h-[4rem] ${baseClasses} mb-4`} />
        <div className={`h-5 ${baseClasses} mb-2`} />
        <div className={`h-4 w-3/4 ${baseClasses}`} />
      </div>
    );
  }
  
  return null;
};

// 错误状态组件
const ErrorCard: React.FC<{ variant: 'recommend' | 'news' | 'project'; className?: string; onRetry?: () => void }> = ({ variant, className = '', onRetry }) => {
  const errorContent = (
    <div className="text-center text-gray-500 dark:text-gray-400">
      <div className="text-2xl mb-2">⚠️</div>
      <div className="text-sm">加载失败</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="text-xs text-blue-500 hover:text-blue-600 mt-1"
        >
          重试
        </button>
      )}
    </div>
  );
  
  if (variant === 'recommend') {
    return (
      <div className={`pt-10 ${className}`}>
        <div className="aspect-[1/1] min-h-[4rem] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
          {errorContent}
        </div>
        <div className="pt-1">
          <div className="text-xl font-bold py-3">加载失败</div>
          <div className="text-sm text-gray-500">请稍后重试</div>
        </div>
      </div>
    );
  }
  
  if (variant === 'news') {
    return (
      <div className={`w-full h-full flex items-center justify-start ${className}`}>
        <div className="aspect-[1/1] h-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
          {errorContent}
        </div>
        <div className="pl-8">
          <div className="text-lg font-bold py-4">加载失败</div>
          <div className="text-sm text-gray-500">请稍后重试</div>
        </div>
      </div>
    );
  }
  
  if (variant === 'project') {
    return (
      <div className={`border border-gray-200 dark:border-zinc-800 rounded-lg p-6 ${className}`}>
        <div className="aspect-[1/1] min-h-[4rem] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-4 flex items-center justify-center">
          {errorContent}
        </div>
        <h3 className="font-medium text-gray-800 dark:text-zinc-100 mb-2">加载失败</h3>
        <div className="text-sm text-gray-500">请稍后重试</div>
      </div>
    );
  }
  
  return null;
};

export const ContentCard: React.FC<ContentCardProps> = ({ 
  data, 
  variant, 
  className = '',
  href,
  isLoading = false,
  onError,
  enableISR = true,
  cacheKey
}) => {
  const router = useRouter();
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isStale: false,
    lastFetch: null,
    retryCount: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ISR缓存检查
  useEffect(() => {
    if (!enableISR || !data?.lastUpdated) return;

    const config = getCacheConfig();
    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const isStale = timeDiff > config.defaultRevalidateTime * 1000;

    setCacheStatus(prev => ({
      ...prev,
      isStale,
      lastFetch: lastUpdated
    }));
  }, [data?.lastUpdated, enableISR]);

  // 处理加载状态
  if (isLoading || isRefreshing) {
    return <LoadingCard variant={variant} className={className} />;
  }
  
  // 处理数据为空的情况
  if (!data || !data.title) {
    return <ErrorCard variant={variant} className={className} />;
  }
  
  // 解构数据属性
  const { title, category, publishDate, content, href: dataHref } = data;
  
  // 格式化发布日期显示
  const formatPublishDate = (dateValue: string | number): string => {
    if (typeof dateValue === 'string') {
      return dateValue; // 如果是字符串，直接返回
    }
    if (typeof dateValue === 'number' && dateValue > 0) {
      // 如果是数字格式（如20240315），转换为可读格式
      const dateStr = dateValue.toString();
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `发布于${year}年${parseInt(month)}月${parseInt(day)}日`;
      }
    }
    return ''; // 无效日期返回空字符串
  };
  
  const formattedPublishDate = formatPublishDate(publishDate);

  const handleClick = () => {
    try {
      const targetHref = dataHref || href;
      if (targetHref) {
        router.push(targetHref);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      onError?.(error as Error);
    }
  };

  if (variant === 'recommend') {
    
    return (
      <div className={`pt-10 cursor-pointer ${className}`} onClick={handleClick}>
        <div className="aspect-[1/1] min-h-[4rem] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <span 
            className="w-full h-full flex items-center justify-center transformCard"
            style={{
              backgroundImage: data.imagePath ? `url(${data.imagePath})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="text-4xl font-bold">
              {typeof content === 'string' ? content : (content ? JSON.stringify(content) : '')}
            </div>
          </span>
        </div>
        <div className="pt-1">
          <div className="text-xl font-bold py-3">
            {title}
          </div>
          <div className="text-sm flex justify-between items-center">
            <div>
              <span className="text-[var(--color-text)] text-bold">
                {category}
              </span>
              <span className="text-[var(--color-btn)] px-3">
                {formattedPublishDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'news') {
    
    return (
      <div className={`cursor-pointer w-full h-full relative ${className}`} onClick={handleClick}>
        <div className="w-full h-full flex items-center justify-start">
          <div className="aspect-[1/1] h-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <span 
              className="w-full h-full flex items-center justify-center transformCard"
              style={{
                backgroundImage: data.imagePath ? `url(${data.imagePath})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="text-4xl font-bold">
                {typeof content === 'string' ? content : (content ? JSON.stringify(content) : '')}
              </div>
            </span>
          </div>
          <div className="pl-8">
            <div className="pt-1">
              <div className="text-lg font-bold py-4">
                {title}
              </div>
              <div className="text-sm flex justify-between items-center">
                <div>
                  <span className="text-[var(--color-text)] text-bold">
                    {category}
                  </span>
                  <span className="text-[var(--color-btn)] px-3">
                    {formattedPublishDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'project') {
    return (
      <div className={`group cursor-pointer relative ${className}`} onClick={handleClick}>
        <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-6 transition-colors duration-200 dark:bg-black">
          <div className="aspect-[1/1] min-h-[4rem] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-4">
            <span 
              className="w-full h-full flex items-center justify-center transformCard"
              style={{
                backgroundImage: data.imagePath ? `url(${data.imagePath})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="text-4xl font-bold">
                {typeof content === 'string' ? content : (content ? JSON.stringify(content) : '')}
              </div>
            </span>
          </div>
          <h3 className="font-medium text-gray-800 dark:text-zinc-100 mb-2">{title}</h3>
          <div className="text-sm flex justify-between items-center">
            <div>
              <span className="text-[var(--color-text)] text-bold">
                {category}
              </span>
              <span className="text-[var(--color-btn)] px-3">
                {formattedPublishDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export type { ContentCardData, ContentCardProps };