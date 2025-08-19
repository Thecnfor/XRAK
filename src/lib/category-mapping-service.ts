import { getBlogData, type BlogCategory } from './blog-data-service'
import { getMappingConfig, DEFAULT_CATEGORY_MAPPINGS } from '@/config/mapping-config'

/**
 * 分类映射缓存接口
 */
interface CategoryMappingCache {
  urlToCategory: Record<string, string>
  categoryToUrl: Record<string, string>
  lastUpdated: number
  version: string
}

/**
 * 分类映射服务类
 * 支持动态更新和ISR机制
 */
class CategoryMappingService {
  private cache: CategoryMappingCache | null = null
  private readonly CACHE_TTL = getMappingConfig().cache.ttl * 1000 // 转换为毫秒
  private readonly CACHE_KEY = 'category-mapping-cache'

  /**
   * 从数据源动态生成映射关系
   */
  private async generateMappingsFromData(): Promise<{
    urlToCategory: Record<string, string>
    categoryToUrl: Record<string, string>
  }> {
    try {
      const blogData = await getBlogData()
      const urlToCategory: Record<string, string> = {}
      const categoryToUrl: Record<string, string> = {}

      // 从 blogInfoPool 中提取映射关系
      Object.entries(blogData.blogInfoPool).forEach(([categoryKey, categoryData]) => {
        if (categoryData.categoryInfo?.href) {
          // 从 href 中提取 URL 路径 (例如: "/tech" -> "tech")
          const urlPath = categoryData.categoryInfo.href.replace(/^\//, '')
          
          // 建立双向映射
          urlToCategory[urlPath] = categoryKey
          categoryToUrl[categoryKey] = urlPath
        }
      })

      return { urlToCategory, categoryToUrl }
    } catch (error) {
      console.error('Failed to generate mappings from data:', error)
      
      // 降级到默认映射
      return this.getDefaultMappings()
    }
  }

  /**
   * 获取默认映射（降级方案）
   */
  private getDefaultMappings(): {
    urlToCategory: Record<string, string>
    categoryToUrl: Record<string, string>
  } {
    return {
      urlToCategory: { ...DEFAULT_CATEGORY_MAPPINGS.urlToCategory },
      categoryToUrl: { ...DEFAULT_CATEGORY_MAPPINGS.categoryToUrl }
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false
    
    const now = Date.now()
    return (now - this.cache.lastUpdated) < this.CACHE_TTL
  }

  /**
   * 更新缓存
   */
  private async updateCache(): Promise<void> {
    const mappings = await this.generateMappingsFromData()
    
    this.cache = {
      urlToCategory: mappings.urlToCategory,
      categoryToUrl: mappings.categoryToUrl,
      lastUpdated: Date.now(),
      version: `${Date.now()}`
    }

    // 根据配置决定是否输出调试信息
    const config = getMappingConfig()
    if (config.development.enableDebugLogs && process.env.NODE_ENV === 'development') {
      console.log('Category mappings updated:', {
        urlToCategory: this.cache.urlToCategory,
        categoryToUrl: this.cache.categoryToUrl,
        version: this.cache.version,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * 获取 URL 到分类的映射
   */
  async getUrlToCategoryMapping(): Promise<Record<string, string>> {
    if (!this.isCacheValid()) {
      await this.updateCache()
    }
    
    return this.cache?.urlToCategory || this.getDefaultMappings().urlToCategory
  }

  /**
   * 获取分类到 URL 的映射
   */
  async getCategoryToUrlMapping(): Promise<Record<string, string>> {
    if (!this.isCacheValid()) {
      await this.updateCache()
    }
    
    return this.cache?.categoryToUrl || this.getDefaultMappings().categoryToUrl
  }

  /**
   * 根据 URL 路径获取分类键
   */
  async getCategoryFromUrl(urlPath: string): Promise<string | null> {
    const mapping = await this.getUrlToCategoryMapping()
    return mapping[urlPath] || null
  }

  /**
   * 根据分类键获取 URL 路径
   */
  async getUrlFromCategory(categoryKey: string): Promise<string | null> {
    const mapping = await this.getCategoryToUrlMapping()
    return mapping[categoryKey] || null
  }

  /**
   * 手动刷新映射缓存
   */
  async refreshMappings(): Promise<void> {
    await this.updateCache()
  }

  /**
   * 获取所有可用的分类
   */
  async getAvailableCategories(): Promise<{
    categories: string[]
    urlPaths: string[]
    mappings: { category: string; urlPath: string; href: string }[]
  }> {
    const urlToCategory = await this.getUrlToCategoryMapping()
    
    const categories = Object.values(urlToCategory)
    const urlPaths = Object.keys(urlToCategory)
    const mappings = Object.entries(urlToCategory).map(([urlPath, category]) => ({
      category,
      urlPath,
      href: `/${urlPath}`
    }))

    return { categories, urlPaths, mappings }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache = null
  }
}

// 创建单例实例
const categoryMappingService = new CategoryMappingService()

// 导出便捷函数
export async function getUrlToCategoryMapping(): Promise<Record<string, string>> {
  return categoryMappingService.getUrlToCategoryMapping()
}

export async function getCategoryToUrlMapping(): Promise<Record<string, string>> {
  return categoryMappingService.getCategoryToUrlMapping()
}

export async function getCategoryFromUrl(urlPath: string): Promise<string | null> {
  return categoryMappingService.getCategoryFromUrl(urlPath)
}

export async function getUrlFromCategory(categoryKey: string): Promise<string | null> {
  return categoryMappingService.getUrlFromCategory(categoryKey)
}

export async function refreshCategoryMappings(): Promise<void> {
  return categoryMappingService.refreshMappings()
}

export async function getAvailableCategories(): Promise<{
  categories: string[]
  urlPaths: string[]
  mappings: { category: string; urlPath: string; href: string }[]
}> {
  return categoryMappingService.getAvailableCategories()
}

export function clearCategoryMappingCache(): void {
  categoryMappingService.clearCache()
}

// 导出服务实例（用于高级用法）
export { categoryMappingService }

// 导出类型
export type { CategoryMappingCache }