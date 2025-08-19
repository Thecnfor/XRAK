'use client'

import { useState, useEffect, useCallback } from 'react'
import { getNavigationData, type NavigationItem } from '@/lib/navigation'
import { getCacheStatus } from '@/lib/blog-data-service'

interface UseNavigationDataReturn {
  navigationData: NavigationItem[]
  isLoading: boolean
  hasError: boolean
  isInitialLoad: boolean
  refetch: () => Promise<void>
  cacheStatus: ReturnType<typeof getCacheStatus>
}

/**
 * 导航数据管理Hook
 * 提供优化的加载状态管理和缓存支持
 */
export function useNavigationData(): UseNavigationDataReturn {
  const [navigationData, setNavigationData] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [cacheStatus, setCacheStatus] = useState(getCacheStatus())

  const loadNavigationData = useCallback(async (forceRefresh = false) => {
    try {
      // 只在初次加载或强制刷新时显示loading状态
      if (isInitialLoad || forceRefresh) {
        setIsLoading(true)
      }
      setHasError(false)
      
      // 更新缓存状态
      setCacheStatus(getCacheStatus())
      
      const data = await getNavigationData()
      setNavigationData(data)
      
      // 使用requestAnimationFrame确保DOM更新后再隐藏loading
      // 这样可以避免闪烁效果
      requestAnimationFrame(() => {
        setIsLoading(false)
        setIsInitialLoad(false)
      })
    } catch (error) {
      console.error('Failed to load navigation data:', error)
      setHasError(true)
      setNavigationData([])
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [isInitialLoad])

  const refetch = useCallback(async () => {
    await loadNavigationData(true)
  }, [loadNavigationData])

  useEffect(() => {
    loadNavigationData()
  }, [loadNavigationData])

  // 定期更新缓存状态
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStatus(getCacheStatus())
    }, 5000) // 每5秒更新一次缓存状态

    return () => clearInterval(interval)
  }, [])

  return {
    navigationData,
    isLoading,
    hasError,
    isInitialLoad,
    refetch,
    cacheStatus
  }
}

/**
 * 获取分离的导航项
 */
export function useNavigationItems(navigationData: NavigationItem[]) {
  const simpleItems = navigationData.filter(item => !item.hasSubmenu)
  const submenuItems = navigationData.filter(item => item.hasSubmenu)
  
  return { simpleItems, submenuItems }
}