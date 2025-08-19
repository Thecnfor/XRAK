'use client'

import { useState, useEffect, useCallback } from 'react'
import { getNavigationData, type NavigationItem } from '@/lib/navigation'
import { getCacheStatus } from '@/lib/blog-data-service'
import { getCacheConfig } from '@/config/isr-config'

interface UseNavigationDataReturn {
  navigationData: NavigationItem[]
  isLoading: boolean
  hasError: boolean
  isInitialLoad: boolean
  refetch: () => Promise<void>
  cacheStatus: ReturnType<typeof getCacheStatus>
  isStale: boolean
  lastFetch: Date | null
  refreshCache: () => Promise<void>
}

interface NavigationCacheState {
  lastFetch: Date | null
  isStale: boolean
  retryCount: number
}

/**
 * 导航数据管理Hook
 * 提供优化的加载状态管理和ISR缓存支持
 */
export function useNavigationData(): UseNavigationDataReturn {
  const [navigationData, setNavigationData] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [cacheStatus, setCacheStatus] = useState(getCacheStatus())
  const [navigationCacheState, setNavigationCacheState] = useState<NavigationCacheState>({
    lastFetch: null,
    isStale: false,
    retryCount: 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadNavigationData = useCallback(async (forceRefresh = false) => {
    try {
      // 只在初次加载或强制刷新时显示loading状态
      if (isInitialLoad || forceRefresh) {
        setIsLoading(true)
      }
      setHasError(false)
      
      // 更新缓存状态
      const currentCacheStatus = getCacheStatus()
      setCacheStatus(currentCacheStatus)
      
      // 优先使用API端点获取数据，降级到直接调用
      let data: NavigationItem[]
      try {
        const response = await fetch('/api/navigation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // 在强制刷新时禁用缓存
          cache: forceRefresh ? 'no-cache' : 'default'
        })
        
        if (response.ok) {
          const result = await response.json()
          data = result.data
        } else {
          throw new Error(`API request failed: ${response.status}`)
        }
      } catch (apiError) {
        console.warn('API navigation fetch failed, falling back to direct call:', apiError)
        data = await getNavigationData()
      }
      
      setNavigationData(data)
      
      // 更新导航缓存状态
      const now = new Date()
      setNavigationCacheState(prev => ({
        ...prev,
        lastFetch: now,
        isStale: false,
        retryCount: 0
      }))
      
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
      setNavigationCacheState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }))
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [isInitialLoad])

  // ISR缓存刷新函数
  const refreshCache = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/revalidate?path=/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to refresh navigation cache')
      }

      // 刷新成功后重新加载数据
      await loadNavigationData(true)
    } catch (error) {
      console.error('Navigation cache refresh failed:', error)
      setNavigationCacheState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }))
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, loadNavigationData])

  const refetch = useCallback(async () => {
    await loadNavigationData(true)
  }, [loadNavigationData])

  useEffect(() => {
    loadNavigationData()
  }, [loadNavigationData])

  // 定期检查缓存状态和过期时间
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStatus(getCacheStatus())
      
      // 检查导航缓存是否过期
      if (navigationCacheState.lastFetch) {
        const config = getCacheConfig()
        const now = new Date()
        const timeDiff = now.getTime() - navigationCacheState.lastFetch.getTime()
        const isStale = timeDiff > config.defaultRevalidateTime * 1000
        
        if (isStale !== navigationCacheState.isStale) {
          setNavigationCacheState(prev => ({
            ...prev,
            isStale
          }))
        }
      }
    }, 5000) // 每5秒更新一次缓存状态

    return () => clearInterval(interval)
  }, [navigationCacheState.lastFetch, navigationCacheState.isStale])

  return {
    navigationData,
    isLoading: isLoading || isRefreshing,
    hasError,
    isInitialLoad,
    refetch,
    cacheStatus,
    isStale: navigationCacheState.isStale,
    lastFetch: navigationCacheState.lastFetch,
    refreshCache
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