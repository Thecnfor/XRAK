/**
 * ISR (Incremental Static Regeneration) 配置
 */

export const ISR_CONFIG = {
  // 默认重新验证时间（秒）
  DEFAULT_REVALIDATE_TIME: 60,
  
  // 默认过期缓存可用时间（秒）
  DEFAULT_STALE_TIME: 300,
  
  // 博客数据相关配置
  BLOG_DATA: {
    // 重新验证时间
    revalidate: parseInt(process.env.ISR_REVALIDATE_TIME || '60'),
    
    // 过期后仍可使用的时间
    staleWhileRevalidate: parseInt(process.env.ISR_STALE_TIME || '300'),
    
    // 最大重试次数
    maxRetries: 3,
    
    // 重试延迟（毫秒）
    retryDelay: 1000
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
    apiBaseUrl: isDev 
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      : process.env.BLOG_API_URL || 'http://localhost:8000',
    endpoints: isDev ? ISR_CONFIG.API_ENDPOINTS.DEV : ISR_CONFIG.API_ENDPOINTS.PROD
  }
}

/**
 * 获取缓存配置
 */
export function getCacheConfig() {
  return ISR_CONFIG.BLOG_DATA
}

/**
 * 获取图片缓存配置
 */
export function getImageCacheConfig() {
  return ISR_CONFIG.IMAGES
}

/**
 * 获取图片缓存键
 */
export function getImageCacheKey(src: string, options?: { width?: number; height?: number; quality?: number }) {
  const baseKey = `${ISR_CONFIG.CACHE_KEYS.IMAGES}:${src}`
  if (options) {
    const optionsStr = Object.entries(options)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return optionsStr ? `${baseKey}?${optionsStr}` : baseKey
  }
  return baseKey
}