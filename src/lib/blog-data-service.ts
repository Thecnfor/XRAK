// 博客数据类型定义
export interface BlogArticle {
  imagePath: string | undefined
  title: string
  category: string
  publishDate: string
  content: string
  source: string
}

export interface BlogCategory {
  categoryInfo: {
    name: string
    href: string
    description: string
    defaultArticle?: string
  }
  articles?: Record<string, BlogArticle>
}

export interface BlogDataPool {
  blogInfoPool: Record<string, BlogCategory>
}

import { getCacheConfig, getDataSourceConfig } from '@/config/isr-config'

// 获取缓存配置
const CACHE_CONFIG = getCacheConfig()

// 内存缓存
let cachedData: BlogDataPool | null = null
let cacheTimestamp: number = 0

/**
 * 获取博客数据源URL
 */
function getDataSourceUrl(): string {
  const config = getDataSourceConfig()
  
  if (config.isDevelopment) {
    // 开发环境使用本地API路由
    return `${config.apiBaseUrl}${config.endpoints.BLOG_DATA}`
  } else {
    // 生产环境使用外部API
    return `${config.apiBaseUrl}${config.endpoints.BLOG_DATA}`
  }
}

/**
 * 检查缓存是否有效
 */
function isCacheValid(): boolean {
  if (!cachedData || !cacheTimestamp) return false
  
  const now = Date.now()
  const cacheAge = (now - cacheTimestamp) / 1000
  
  return cacheAge < CACHE_CONFIG.revalidate
}

/**
 * 检查是否可以使用过期缓存
 */
function canUseStaleCache(): boolean {
  if (!cachedData || !cacheTimestamp) return false
  
  const now = Date.now()
  const cacheAge = (now - cacheTimestamp) / 1000
  
  return cacheAge < CACHE_CONFIG.staleWhileRevalidate
}

/**
 * 从API获取博客数据
 */
async function fetchBlogDataFromAPI(): Promise<BlogDataPool> {
  const url = getDataSourceUrl()
  
  try {
    const response = await fetch(url, {
      next: {
        revalidate: CACHE_CONFIG.revalidate
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data as BlogDataPool
  } catch (error) {
    console.error('Failed to fetch blog data from API:', error)
    throw error
  }
}

/**
 * 从本地文件获取博客数据（开发环境备用）
 */
async function fetchBlogDataFromLocal(): Promise<BlogDataPool> {
  try {
    // 动态导入以避免构建时的静态分析
    const blogData = await import('../../docs/blog-data.json')
    return blogData.default as unknown as BlogDataPool
  } catch (error) {
    console.error('Failed to load local blog data:', error)
    throw error
  }
}

/**
 * 获取博客数据（带ISR支持）
 */
export async function getBlogData(): Promise<BlogDataPool> {
  // 检查缓存是否有效
  if (isCacheValid()) {
    return cachedData!
  }
  
  try {
    // 尝试从API获取新数据
    const freshData = await fetchBlogDataFromAPI()
    
    // 更新缓存
    cachedData = freshData
    cacheTimestamp = Date.now()
    
    return freshData
  } catch (error) {
    // API失败时的降级策略
    console.warn('API fetch failed, attempting fallback strategies:', error)
    
    // 如果有过期缓存，先返回过期数据
    if (canUseStaleCache()) {
      console.log('Using stale cache while attempting background refresh')
      
      // 后台异步刷新（不等待结果）
      setTimeout(async () => {
        try {
          const refreshedData = await fetchBlogDataFromAPI()
          cachedData = refreshedData
          cacheTimestamp = Date.now()
        } catch (bgError) {
          console.error('Background refresh failed:', bgError)
        }
      }, 0)
      
      return cachedData!
    }
    
    // 最后的降级：使用本地数据
    try {
      console.log('Falling back to local data')
      const localData = await fetchBlogDataFromLocal()
      
      // 缓存本地数据
      cachedData = localData
      cacheTimestamp = Date.now()
      
      return localData
    } catch (localError) {
      console.error('All data sources failed:', localError)
      throw new Error('Unable to load blog data from any source')
    }
  }
}

/**
 * 强制刷新缓存
 */
export async function refreshBlogDataCache(): Promise<BlogDataPool> {
  cachedData = null
  cacheTimestamp = 0
  return await getBlogData()
}

/**
 * 获取缓存状态
 */
export function getCacheStatus() {
  return {
    hasCachedData: !!cachedData,
    cacheTimestamp,
    isValid: isCacheValid(),
    canUseStale: canUseStaleCache(),
    cacheAge: cacheTimestamp ? (Date.now() - cacheTimestamp) / 1000 : 0
  }
}