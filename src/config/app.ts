export const APP_CONFIG = {
  name: 'XRAK',
  description: '基于Next.js构建的现代化Web应用',
  version: '1.0.0',
  author: 'XRAK Team',
  
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // 主题配置
  theme: {
    defaultMode: 'light' as const,
    supportedModes: ['light', 'dark'] as const,
  },
  
  // 语言配置
  i18n: {
    defaultLocale: 'zh-CN',
    supportedLocales: ['zh-CN', 'en-US'],
  },
  
  // 缓存配置
  cache: {
    defaultTTL: 300, // 5分钟
    maxAge: 3600, // 1小时
  },
} as const

export type AppConfig = typeof APP_CONFIG