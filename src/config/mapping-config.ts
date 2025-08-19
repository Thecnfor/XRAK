/**
 * 分类映射配置文件
 * 支持动态映射和ISR机制
 */

/**
 * 映射配置接口
 */
export interface MappingConfig {
  // 缓存配置
  cache: {
    ttl: number // 缓存生存时间（秒）
    enableMemoryCache: boolean // 是否启用内存缓存
    enableApiCache: boolean // 是否启用API缓存
  }
  
  // 数据源配置
  dataSource: {
    primary: 'blog-data-json' | 'external-api' // 主要数据源
    fallback: 'blog-data-json' | 'default-mappings' // 降级数据源
    refreshInterval: number // 刷新间隔（秒）
  }
  
  // 开发配置
  development: {
    enableDebugLogs: boolean // 是否启用调试日志
    autoRefresh: boolean // 是否自动刷新
    hotReload: boolean // 是否支持热重载
  }
  
  // 生产配置
  production: {
    enableCaching: boolean // 是否启用缓存
    enableCompression: boolean // 是否启用压缩
    enableCDN: boolean // 是否启用CDN
  }
}

/**
 * 默认映射配置
 */
const DEFAULT_MAPPING_CONFIG: MappingConfig = {
  cache: {
    ttl: 3600, // 1小时
    enableMemoryCache: true,
    enableApiCache: true
  },
  
  dataSource: {
    primary: 'blog-data-json',
    fallback: 'default-mappings',
    refreshInterval: 300 // 5分钟
  },
  
  development: {
    enableDebugLogs: true,
    autoRefresh: true,
    hotReload: true
  },
  
  production: {
    enableCaching: true,
    enableCompression: true,
    enableCDN: false
  }
}

/**
 * 获取映射配置
 */
export function getMappingConfig(): MappingConfig {
  // 从环境变量覆盖配置
  const config: MappingConfig = {
    ...DEFAULT_MAPPING_CONFIG,
    cache: {
      ...DEFAULT_MAPPING_CONFIG.cache,
      ttl: parseInt(process.env.MAPPING_CACHE_TTL || '3600'),
      enableMemoryCache: process.env.MAPPING_ENABLE_MEMORY_CACHE !== 'false',
      enableApiCache: process.env.MAPPING_ENABLE_API_CACHE !== 'false'
    },
    
    dataSource: {
      ...DEFAULT_MAPPING_CONFIG.dataSource,
      primary: (process.env.MAPPING_PRIMARY_SOURCE as DataSource) || 'blog-data-json',
      fallback: (process.env.MAPPING_FALLBACK_SOURCE as MappingConfig['dataSource']['fallback']) || 'default-mappings',
      refreshInterval: parseInt(process.env.MAPPING_REFRESH_INTERVAL || '300')
    },
    
    development: {
      ...DEFAULT_MAPPING_CONFIG.development,
      enableDebugLogs: process.env.MAPPING_DEBUG_LOGS !== 'false',
      autoRefresh: process.env.MAPPING_AUTO_REFRESH !== 'false',
      hotReload: process.env.MAPPING_HOT_RELOAD !== 'false'
    },
    
    production: {
      ...DEFAULT_MAPPING_CONFIG.production,
      enableCaching: process.env.MAPPING_ENABLE_CACHING !== 'false',
      enableCompression: process.env.MAPPING_ENABLE_COMPRESSION !== 'false',
      enableCDN: process.env.MAPPING_ENABLE_CDN === 'true'
    }
  }
  
  return config
}

/**
 * 获取当前环境的映射配置
 */
export function getCurrentMappingConfig() {
  const config = getMappingConfig()
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    ...config,
    current: isDevelopment ? config.development : config.production,
    environment: isDevelopment ? 'development' : 'production'
  }
}

/**
 * 映射策略配置
 */
export const MAPPING_STRATEGIES = {
  development: {
    primarySource: 'blog-data-json',
    fallbackSource: 'default-mappings',
    cacheStrategy: 'memory-first',
    refreshStrategy: 'auto'
  },
  
  production: {
    primarySource: 'external-api',
    fallbackSource: 'blog-data-json',
    cacheStrategy: 'api-first',
    refreshStrategy: 'manual'
  }
} as const

/**
 * 默认分类映射（降级方案）
 */
export const DEFAULT_CATEGORY_MAPPINGS = {
  urlToCategory: {
    'tech': '技术',
    'architecture': '架构',
    'frontend': '前端',
    'ai': 'AI',
    'blockchain': '区块链',
    'research': '研究',
    'me': '个人简介'
  },
  
  categoryToUrl: {
    '技术': 'tech',
    '架构': 'architecture',
    '前端': 'frontend',
    'AI': 'ai',
    '区块链': 'blockchain',
    '研究': 'research',
    '个人简介': 'me'
  }
} as const

/**
 * 映射验证规则
 */
export const MAPPING_VALIDATION = {
  urlPath: {
    pattern: /^[a-z0-9-]+$/,
    maxLength: 50,
    minLength: 1
  },
  
  categoryKey: {
    maxLength: 20,
    minLength: 1,
    allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/
  }
} as const

// 导出类型
export type MappingStrategy = keyof typeof MAPPING_STRATEGIES
export type DataSource = MappingConfig['dataSource']['primary']
export type CacheStrategy = 'memory-first' | 'api-first' | 'hybrid'
export type RefreshStrategy = 'auto' | 'manual' | 'scheduled'