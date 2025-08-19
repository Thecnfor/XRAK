'use client'

import React from 'react'

interface NavigationSkeletonProps {
  /** 骨架屏项目数量 */
  itemCount?: number
  /** 是否为移动端样式 */
  isMobile?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 导航骨架屏组件
 * 提供优雅的加载状态显示
 */
export function NavigationSkeleton({ 
  itemCount = 5, 
  isMobile = false, 
  className = '' 
}: NavigationSkeletonProps) {
  const items = Array.from({ length: itemCount }, (_, i) => i)
  
  if (isMobile) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="h-5 bg-neutral-300 dark:bg-neutral-600 rounded flex-1 mr-4"></div>
            <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {items.map((i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-4 bg-neutral-300 dark:bg-neutral-600 rounded flex-1"></div>
          <div className="h-3 w-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      ))}
    </div>
  )
}

/**
 * 导航错误状态组件
 */
interface NavigationErrorProps {
  /** 错误信息 */
  message?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 是否显示刷新页面按钮 */
  showRefresh?: boolean
  /** 是否为移动端样式 */
  isMobile?: boolean
  /** 自定义类名 */
  className?: string
}

export function NavigationError({ 
  message = '导航加载失败',
  onRetry,
  showRefresh = true,
  isMobile = false,
  className = ''
}: NavigationErrorProps) {
  const containerClass = isMobile ? 'p-4' : ''
  
  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-red-500 dark:text-red-400 text-sm p-3 md:p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
        <p className="font-medium mb-1 md:mb-2">{message}</p>
        <p className="text-xs opacity-75 mb-2 md:mb-3">请检查网络连接或重试</p>
        <div className="flex gap-2">
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="text-xs bg-red-100 dark:bg-red-800 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              重新加载
            </button>
          )}
          {showRefresh && (
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-400"
            >
              刷新页面
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 缓存状态指示器
 */
interface CacheStatusIndicatorProps {
  /** 缓存状态 */
  cacheStatus: {
    hasCachedData: boolean
    isValid: boolean
    canUseStale: boolean
    cacheAge: number
  }
  /** 是否显示详细信息 */
  showDetails?: boolean
}

export function CacheStatusIndicator({ 
  cacheStatus, 
  showDetails = false 
}: CacheStatusIndicatorProps) {
  if (!showDetails || !cacheStatus.hasCachedData) {
    return null
  }
  
  const getStatusColor = () => {
    if (cacheStatus.isValid) return 'text-green-500'
    if (cacheStatus.canUseStale) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  const getStatusText = () => {
    if (cacheStatus.isValid) return '缓存有效'
    if (cacheStatus.canUseStale) return '使用过期缓存'
    return '缓存已失效'
  }
  
  return (
    <div className="text-xs opacity-50 mt-2">
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      <span className="ml-2">
        ({Math.round(cacheStatus.cacheAge)}s)
      </span>
    </div>
  )
}