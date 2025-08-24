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
    // 开发环境优先使用外部API服务器（如果配置了BLOG_API_URL）
    const externalApiUrl = process.env.BLOG_API_URL
    if (externalApiUrl) {
      return externalApiUrl
    }
    // 降级到本地API路由
    return `${config.apiBaseUrl}${config.endpoints.BLOG_DATA}`
  } else {
    // 生产环境使用外部API
    const externalApiUrl = process.env.BLOG_API_URL
    if (externalApiUrl) {
      return externalApiUrl
    }
    // 降级到本地API路由
    return `${config.apiBaseUrl}${config.endpoints.BLOG_DATA}`
  }
}

/**
 * 检查缓存是否有效
 */
function isCacheValid(): boolean {
  if (!cachedData || !cacheTimestamp) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[BlogDataService] Cache invalid: no data or timestamp')
    }
    return false
  }
  
  const now = Date.now()
  const cacheAge = (now - cacheTimestamp) / 1000
  const isValid = cacheAge < CACHE_CONFIG.revalidate
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[BlogDataService] Cache check:', {
      cacheAge: Math.round(cacheAge),
      revalidateTime: CACHE_CONFIG.revalidate,
      isValid
    })
  }
  
  return isValid
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
    
    const rawData = await response.json()
    
    // 转换原始数据为BlogDataPool格式
    const blogInfoPool: Record<string, BlogCategory> = {}
    
    // 检查是否是单篇文章的响应格式：{"success":true,"data":{"id":"1","title":"..."}}
    if (rawData?.success && rawData?.data && rawData?.data?.id) {
      // 这是单篇文章的响应，需要构造分类结构
      const articleData = rawData.data
      const categoryKey = articleData.category || 'default'
      
      blogInfoPool[categoryKey] = {
        categoryInfo: {
          name: categoryKey === 'tech' ? '技术分享' : categoryKey === 'life' ? '生活随笔' : '默认分类',
          href: `/${categoryKey}`,
          description: categoryKey === 'tech' ? '技术分享' : categoryKey === 'life' ? '生活随笔' : '默认分类',
          defaultArticle: `/${categoryKey}/${articleData.id}`
        },
        articles: {
          [articleData.id]: {
            imagePath: articleData.imagePath || '',
            title: articleData.title || `Article ${articleData.id}`,
            category: articleData.category || categoryKey,
            publishDate: articleData.publishDate || new Date().toISOString(),
            content: articleData.content || '',
            source: 'api'
          } as BlogArticle
        }
      }
    } else {
      // 适配分类数据格式：{"success":true,"data":{"categories":{...}}}
      const categories = rawData?.data?.categories || rawData?.categories || rawData?.blogInfoPool
      
      if (categories && typeof categories === 'object') {
        Object.entries(categories).forEach(([categoryKey, categoryData]: [string, unknown]) => {
          const category = categoryData as {
            title: string
            href: string
            hasSubmenu?: boolean
            defaultArticle?: string
            articles?: Record<string, unknown>
            categoryInfo?: {
              name: string
              href: string
              description?: string
              defaultArticle?: string
            }
          }
          
          // 支持两种格式：直接的category对象或包含categoryInfo的对象
          const categoryInfo = category.categoryInfo || {
            name: category.title,
            href: category.href,
            description: category.title,
            defaultArticle: category.defaultArticle
          }
          
          blogInfoPool[categoryKey] = {
            categoryInfo: {
              name: categoryInfo.name,
              href: categoryInfo.href,
              description: categoryInfo.description || categoryInfo.name, // 确保description始终有值
              defaultArticle: categoryInfo.defaultArticle
            },
            articles: category.articles ? Object.fromEntries(
              Object.entries(category.articles).map(([articleKey, article]: [string, unknown]) => {
                const articleData = article as {
                  id?: string
                  title?: string
                  publishDate?: string
                  content?: string
                  blocks?: unknown[]
                  imagePath?: string
                  category?: string
                }
                
                return [
                  articleKey,
                  {
                    imagePath: articleData.imagePath || '',
                    title: articleData.title || `Article ${articleKey}`,
                    category: articleData.category || categoryInfo.name,
                    publishDate: articleData.publishDate || new Date().toISOString(),
                    content: articleData.content || '',
                    source: 'api'
                  } as BlogArticle
                ]
              })
            ) : {}
          }
        })
      }
    }
    
    return { blogInfoPool }
  } catch (error) {
    console.error('Failed to fetch blog data from API:', error)
    throw error
  }
} 

/**
 * 从本地文件获取博客数据（开发环境备用）
 */
async function fetchBlogDataFromLocal(): Promise<BlogDataPool> {
  // 返回默认的数据结构作为降级方案，与 route.ts 中的 getFallbackData 保持一致
  // 在生产环境中，应该从实际的数据源获取数据
  return {
    blogInfoPool: {
      "XRAK": {
        categoryInfo: {
          name: "个人简介",
          href: "/me",
          description: "个人简介和信息",
          defaultArticle: "/me"
        }
      }
    }
  }
}

/**
 * 获取博客数据（带ISR支持）
 */
export async function getBlogData(): Promise<BlogDataPool> {
  // 检查缓存是否有效
  if (isCacheValid() && cachedData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[BlogDataService] Using cached data')
    }
    return cachedData
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[BlogDataService] Fetching fresh data from API...')
  }
  
  try {
    // 尝试从API获取新数据
    const freshData = await fetchBlogDataFromAPI()
    
    // 更新缓存
    cachedData = freshData
    cacheTimestamp = Date.now()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[BlogDataService] Cache updated with fresh API data:', {
        categoriesCount: Object.keys(freshData.blogInfoPool).length,
        timestamp: new Date().toISOString()
      })
    }
    
    return freshData
  } catch (error) {
    // API失败时的降级策略
    console.warn('[BlogDataService] API fetch failed, attempting fallback strategies:', error)
    
    // 如果有过期缓存，先返回过期数据
    if (canUseStaleCache() && cachedData) {
      console.log('[BlogDataService] Using stale cache while attempting background refresh')
      
      // 后台异步刷新（不等待结果）
      setTimeout(async () => {
        try {
          const refreshedData = await fetchBlogDataFromAPI()
          cachedData = refreshedData
          cacheTimestamp = Date.now()
          if (process.env.NODE_ENV === 'development') {
            console.log('[BlogDataService] Background refresh completed')
          }
        } catch (bgError) {
          console.error('[BlogDataService] Background refresh failed:', bgError)
        }
      }, 0)
      
      return cachedData
    }
    
    // 最后的降级：使用本地数据
    try {
      console.log('[BlogDataService] Falling back to local data')
      const localData = await fetchBlogDataFromLocal()
      
      // 缓存本地数据
      cachedData = localData
      cacheTimestamp = Date.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[BlogDataService] Using local fallback data:', {
          categoriesCount: Object.keys(localData.blogInfoPool).length
        })
      }
      
      return localData
    } catch (localError) {
      console.error('[BlogDataService] All data sources failed:', localError)
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