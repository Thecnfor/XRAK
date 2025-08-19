/**
 * ISR (Incremental Static Regeneration) 配置
 * 统一管理增量静态再生相关的配置项
 */

// 环境变量类型定义
interface ISREnvironmentConfig {
  revalidateTime: number;
  staleTime: number;
  enableOnDemand: boolean;
  maxRetries: number;
  retryDelay: number;
}

// 缓存状态接口
export interface CacheStatus {
  isStale: boolean;
  lastFetch: Date | null;
  retryCount: number;
  nextRevalidation?: Date;
}

// 获取环境变量配置
function getEnvironmentConfig(): ISREnvironmentConfig {
  return {
    revalidateTime: parseInt(process.env.ISR_REVALIDATE_TIME || '60'),
    staleTime: parseInt(process.env.ISR_STALE_TIME || '300'),
    enableOnDemand: process.env.ISR_ENABLE_ON_DEMAND === 'true',
    maxRetries: parseInt(process.env.ISR_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.ISR_RETRY_DELAY || '1000')
  };
}

export const ISR_CONFIG = {
  // 默认重新验证时间（秒）
  DEFAULT_REVALIDATE_TIME: 60,
  
  // 默认过期缓存可用时间（秒）
  DEFAULT_STALE_TIME: 300,
  
  // 环境变量配置
  ENV: getEnvironmentConfig(),
  
  // 博客数据相关配置
  BLOG_DATA: {
    // 重新验证时间
    revalidate: getEnvironmentConfig().revalidateTime,
    
    // 过期后仍可使用的时间
    staleWhileRevalidate: getEnvironmentConfig().staleTime,
    
    // 最大重试次数
    maxRetries: getEnvironmentConfig().maxRetries,
    
    // 重试延迟（毫秒）
    retryDelay: getEnvironmentConfig().retryDelay,
    
    // 是否启用按需重新验证
    enableOnDemand: getEnvironmentConfig().enableOnDemand
  },
  
  // 缓存键前缀
  CACHE_KEYS: {
    BLOG_DATA: 'blog-data',
    NAVIGATION: 'navigation',
    CONTENT_CARDS: 'content-cards',
    IMAGES: 'images',
    IMAGE_METADATA: 'image-metadata'
  },
  
  // 图片相关配置
  IMAGES: {
    // 图片重新验证时间（秒）
    revalidate: parseInt(process.env.ISR_IMAGE_REVALIDATE_TIME || '3600'), // 1小时
    
    // 图片过期后仍可使用的时间（秒）
    staleWhileRevalidate: parseInt(process.env.ISR_IMAGE_STALE_TIME || '86400'), // 24小时
    
    // 图片缓存最大时间（秒）
    maxAge: parseInt(process.env.ISR_IMAGE_MAX_AGE || '31536000'), // 1年
    
    // 支持的图片格式
    supportedFormats: ['webp', 'avif', 'jpeg', 'png', 'svg'],
    
    // 图片质量配置
    quality: {
      default: 75,
      high: 90,
      low: 60
    }
  },
  
  // API端点配置
  API_ENDPOINTS: {
    // 开发环境
    DEV: {
      BLOG_DATA: '/api/blog-data'
    },
    
    // 生产环境
    PROD: {
      BLOG_DATA: '/api/blog-data'
    }
  }
} as const

/**
 * 获取数据源配置
 */
export function getDataSourceConfig() {
  const isDev = process.env.NODE_ENV === 'development'
  
  return {
    isDevelopment: isDev,
    apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    endpoints: isDev ? ISR_CONFIG.API_ENDPOINTS.DEV : ISR_CONFIG.API_ENDPOINTS.PROD
  }
}

/**
 * 获取缓存配置
 */
export function getCacheConfig() {
  return {
    ...ISR_CONFIG.BLOG_DATA,
    defaultRevalidateTime: ISR_CONFIG.ENV.revalidateTime,
    defaultStaleTime: ISR_CONFIG.ENV.staleTime
  }
}

/**
 * 获取图片缓存配置
 */
export function getImageCacheConfig() {
  return ISR_CONFIG.IMAGES
}

/**
 * 检查缓存是否过期
 */
export function isCacheStale(lastFetch: Date | null, revalidateTime?: number): boolean {
  if (!lastFetch) return true
  
  const now = new Date()
  const timeDiff = now.getTime() - lastFetch.getTime()
  const threshold = (revalidateTime || ISR_CONFIG.ENV.revalidateTime) * 1000
  
  return timeDiff > threshold
}

/**
 * 创建缓存状态对象
 */
export function createCacheStatus(lastFetch?: Date | null, retryCount = 0): CacheStatus {
  const isStale = isCacheStale(lastFetch || null)
  const nextRevalidation = lastFetch 
    ? new Date(lastFetch.getTime() + ISR_CONFIG.ENV.revalidateTime * 1000)
    : undefined
  
  return {
    isStale,
    lastFetch: lastFetch || null,
    retryCount,
    nextRevalidation
  }
}

/**
 * 获取重新验证API路径
 */
export function getRevalidatePath(cacheKey: string): string {
  return `/api/revalidate?path=${encodeURIComponent(cacheKey)}`
}

/**
 * 获取完整的ISR配置
 */
export function getISRConfig() {
  return {
    ...ISR_CONFIG,
    environment: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  }
}

/**
 * 获取图片缓存键
 */
export function getImageCacheKey(src: string, options?: { width?: number; height?: number; quality?: number }) {
  const baseKey = `${ISR_CONFIG.CACHE_KEYS.IMAGES}:${src}`
  if (options) {
    const optionsStr = Object.entries(options)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return optionsStr ? `${baseKey}?${optionsStr}` : baseKey
  }
  return baseKey
}