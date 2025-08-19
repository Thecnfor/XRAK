import { getBlogData, type BlogCategory, type BlogArticle } from './blog-data-service'
import { getCacheConfig, getDataSourceConfig } from '@/config/isr-config'
import { getCategoryFromUrl } from './category-mapping-service'
import path from 'path'
import fs from 'fs/promises'

// 文章内容块类型
export interface ContentBlock {
  type: 'title' | 'content' | 'section' | 'code' | 'image' | 'double-image' | 'image-text'
  id: string
  data: {
    text?: string
    title?: string
    content?: string
    level?: number
    code?: string
    language?: string
    src?: string
    alt?: string
    caption?: string
    leftImage?: {
      src: string
      alt: string
      caption?: string
    }
    rightImage?: {
      src: string
      alt: string
      caption?: string
    }
    image?: {
      src: string
      alt: string
      caption?: string
    }
  }
}

// 文章内容结构
export interface ArticleContent {
  blocks: ContentBlock[]
}

// 扩展的文章类型，包含详细内容
export interface DetailedArticle extends Omit<BlogArticle, 'source'> {
  excerpt: string
  tags?: string[]
  readTime?: string
  author?: string
  source?: string
  // 新增：支持结构化内容
  structuredContent?: ArticleContent
}

export interface DetailedCategory {
  category: string
  categoryInfo: {
    name: string
    href: string
    description: string
    defaultArticle?: string
  }
  articles: Record<string, DetailedArticle>
  metadata?: {
    lastUpdated: string
    version: string
    environment: string
  }
}

/**
 * 后端 API 路由配置
 * 为后端集成做准备，定义所有内容相关的 API 端点
 */
const API_ROUTES = {
  // 基础 API 地址
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  
  // 文章相关路由
  ARTICLES: {
    // 获取单篇文章详情: GET /api/articles/{category}/{articleId}
    GET_ARTICLE: (category: string, articleId: string) => `/api/articles/${category}/${articleId}`,
    // 获取分类下所有文章: GET /api/articles/{category}
    GET_CATEGORY_ARTICLES: (category: string) => `/api/articles/${category}`,
    // 获取文章列表概览: GET /api/articles
    GET_ARTICLES_OVERVIEW: '/api/articles',
    // 搜索文章: GET /api/articles/search?q={query}
    SEARCH_ARTICLES: (query: string) => `/api/articles/search?q=${encodeURIComponent(query)}`
  },
  
  // 分类相关路由
  CATEGORIES: {
    // 获取所有分类: GET /api/categories
    GET_ALL: '/api/categories',
    // 获取分类详情: GET /api/categories/{categoryKey}
    GET_CATEGORY: (categoryKey: string) => `/api/categories/${categoryKey}`
  },
  
  // 内容管理路由（后台使用）
  CONTENT: {
    // 预热缓存: POST /api/content/preload
    PRELOAD: '/api/content/preload',
    // 清除缓存: DELETE /api/content/cache
    CLEAR_CACHE: '/api/content/cache'
  }
} as const

/**
 * 内容获取策略配置
 */
const CONTENT_STRATEGY = {
  // 开发环境：优先使用 docs/content 目录的详细内容
  development: {
    primarySource: 'local-content',
    fallbackSource: 'blog-data-json'
  },
  // 生产环境：优先使用 API，降级到本地数据
  production: {
    primarySource: 'external-api',
    fallbackSource: 'blog-data-json'
  }
} as const

/**
 * 获取内容目录路径
 */
function getContentDirectory(): string {
  return path.join(process.cwd(), 'docs', 'content')
}

/**
 * 根据URL路径获取分类键
 */
async function getCategoryKeyFromUrl(urlPath: string): Promise<string> {
  const categoryKey = await getCategoryFromUrl(urlPath)
  return categoryKey || urlPath
}

/**
 * 从 docs/content 目录读取详细内容
 */
async function loadDetailedContent(categoryKey: string): Promise<DetailedCategory | null> {
  try {
    // 过滤特殊路径（如Vite开发工具请求）
    // 处理URL编码的情况，如 %40vite -> @vite
    const decodedKey = decodeURIComponent(categoryKey)
    if (categoryKey.startsWith('@') || categoryKey.startsWith('_') || 
        categoryKey.startsWith('%40') || categoryKey.startsWith('%5F') ||
        decodedKey.startsWith('@') || decodedKey.startsWith('_')) {
      return null
    }
    
    const contentDir = getContentDirectory()
    const categoryDir = path.join(contentDir, categoryKey)
    
    // 检查分类目录是否存在
    try {
      await fs.access(categoryDir)
    } catch {
      console.warn(`Category directory ${categoryKey} not found`)
      return null
    }
    
    // 读取分类目录下的所有 JSON 文件
    const files = await fs.readdir(categoryDir)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in category ${categoryKey}`)
      return null
    }
    
    // 读取所有文章文件
    const articles: Record<string, DetailedArticle> = {}
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(categoryDir, file)
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const articleData = JSON.parse(fileContent)
        
        // 提取文章ID（文件名去掉.json后缀）
        const articleId = file.replace('.json', '')
        
        // 转换为 DetailedArticle 格式
        articles[articleId] = {
          imagePath: articleData.meta.imagePath || '', // 添加默认的imagePath属性
          title: articleData.meta.title,
          category: articleData.meta.category,
          publishDate: articleData.meta.publishDate,
          content: typeof articleData.content === 'string' 
            ? articleData.content 
            : JSON.stringify(articleData.content, null, 2),
          excerpt: articleData.meta.excerpt || articleData.meta.description,
          tags: articleData.meta.tags,
          readTime: articleData.meta.readTime,
          author: articleData.meta.author,
          // 新增：保存结构化内容
          structuredContent: articleData.content?.blocks ? articleData.content : undefined
        }
      } catch (error) {
        console.warn(`Failed to load article ${file} in category ${categoryKey}:`, error)
      }
    }
    
    // 获取分类信息
    const blogData = await getBlogData()
    const mappedCategoryKey = getCategoryKeyFromUrl(categoryKey)
    const categoryInfo = (await mappedCategoryKey && blogData.blogInfoPool[await mappedCategoryKey]?.categoryInfo) ||
                        blogData.blogInfoPool[categoryKey]?.categoryInfo
    
    if (!categoryInfo) {
      console.warn(`Category info not found for ${categoryKey}`)
      return null
    }
    
    return {
      category: categoryKey,
      categoryInfo,
      articles,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
  } catch (error) {
    console.warn(`Failed to load detailed content for category ${categoryKey}:`, error)
    return null
  }
}

/**
 * 列出所有可用的内容文件
 */
export async function listAvailableContent(): Promise<string[]> {
  try {
    const contentDir = getContentDirectory()
    const files = await fs.readdir(contentDir)
    
    return files
      .filter(file => file.endsWith('-articles.json'))
      .map(file => file.replace('-articles.json', ''))
  } catch (error) {
    console.warn('Failed to list content directory:', error)
    return []
  }
}

/**
 * 获取单个文章的详细内容
 */
export async function getArticleContent(
  categoryKey: string, 
  articleId: string
): Promise<DetailedArticle | null> {
  const config = getDataSourceConfig()
  const strategy = CONTENT_STRATEGY[config.isDevelopment ? 'development' : 'production']
  
  // 获取正确的分类键
  const mappedCategoryKey = getCategoryKeyFromUrl(categoryKey)
  
  // 策略1：尝试从详细内容文件获取
  if (strategy.primarySource === 'local-content') {
    const detailedContent = await loadDetailedContent(categoryKey)
    if (detailedContent?.articles[articleId]) {
      return detailedContent.articles[articleId]
    }
  }
  
  // 策略2：降级到基础博客数据
  try {
    const blogData = await getBlogData()
    let category = blogData.blogInfoPool[categoryKey] as BlogCategory
    
    // 如果直接匹配失败，尝试映射键
    if (!category) {
      category = blogData.blogInfoPool[await mappedCategoryKey] as BlogCategory
    }
    
    const article = category?.articles?.[articleId]
    
    if (article) {
      // 转换为详细文章格式
      return {
        excerpt: article.content.slice(0, 200), // 从文章内容截取前200个字符作为摘要
        ...article,
        source: config.isDevelopment ? '开发环境数据' : '生产环境数据'
      }
    }
  } catch (error) {
    console.error('Failed to get article from blog data:', error)
  }
  
  return null
}



/**
 * 获取分类的所有文章（带详细内容）
 */
export async function getCategoryContent(categoryKey: string): Promise<{
  categoryInfo: {
    name: string
    href: string
    description: string
    defaultArticle?: string
  }
  articles: DetailedArticle[]
}> {
  // 过滤特殊路径（如Vite开发工具请求）
  // 处理URL编码的情况，如 %40vite -> @vite
  const decodedKey = decodeURIComponent(categoryKey)
  if (categoryKey.startsWith('@') || categoryKey.startsWith('_') || 
      categoryKey.startsWith('%40') || categoryKey.startsWith('%5F') ||
      decodedKey.startsWith('@') || decodedKey.startsWith('_')) {
    throw new Error(`Invalid category path: ${categoryKey}`)
  }
  
  const config = getDataSourceConfig()
  const strategy = CONTENT_STRATEGY[config.isDevelopment ? 'development' : 'production']
  
  // 获取基础分类信息
  const blogData = await getBlogData()
  
  // 尝试直接匹配，如果失败则尝试URL映射
  let category = blogData.blogInfoPool[categoryKey] as BlogCategory
  if (!category) {
    const mappedKey = await getCategoryKeyFromUrl(categoryKey)
    category = blogData.blogInfoPool[mappedKey] as BlogCategory
  }
  
  if (!category) {
    throw new Error(`Category ${categoryKey} not found`)
  }
  
  let articles: DetailedArticle[] = []
  
  // 策略1：尝试从详细内容文件获取
  if (strategy.primarySource === 'local-content') {
    const detailedContent = await loadDetailedContent(categoryKey)
    if (detailedContent?.articles) {
      articles = Object.values(detailedContent.articles)
    }
  }
  
  // 策略2：降级到基础数据
  if (articles.length === 0 && category.articles) {
    articles = Object.values(category.articles).map(article => ({
      excerpt: article.content.slice(0, 200), // 从文章内容截取前200个字符作为摘要
      ...article,
      source: config.isDevelopment ? '开发环境数据' : '生产环境数据'
    }))
  }
  
  return {
    categoryInfo: category.categoryInfo,
    articles
  }
}

/**
 * 获取所有内容的概览
 */
export async function getContentOverview() {
  const blogData = await getBlogData()
  const availableContent = await listAvailableContent()
  const config = getDataSourceConfig()
  
  return {
    totalCategories: Object.keys(blogData.blogInfoPool).length,
    availableDetailedContent: availableContent,
    contentStrategy: CONTENT_STRATEGY[config.isDevelopment ? 'development' : 'production'],
    environment: config.isDevelopment ? 'development' : 'production',
    cacheConfig: getCacheConfig()
  }
}

/**
 * 预热内容缓存
 */
export async function preloadContent() {
  try {
    const blogData = await getBlogData()
    const availableContent = await listAvailableContent()
    
    console.log('Content preload completed:', {
      categories: Object.keys(blogData.blogInfoPool).length,
      detailedContent: availableContent.length
    })
  } catch (error) {
    console.error('Content preload failed:', error)
  }
}

/**
 * 后端 API 调用辅助函数
 * 为生产环境的后端集成做准备
 */

/**
 * 通用 API 请求函数
 */
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_ROUTES.BASE_URL}${url}`
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API request error for ${fullUrl}:`, error)
    throw error
  }
}

/**
 * 从后端 API 获取文章内容
 * 生产环境使用，开发环境作为备用
 */
export async function getArticleFromAPI(
  category: string, 
  articleId: string
): Promise<DetailedArticle | null> {
  try {
    const url = API_ROUTES.ARTICLES.GET_ARTICLE(category, articleId)
    return await apiRequest<DetailedArticle>(url)
  } catch (error) {
    console.error('Failed to fetch article from API:', error)
    return null
  }
}

/**
 * 从后端 API 获取分类内容
 * 生产环境使用，开发环境作为备用
 */
export async function getCategoryFromAPI(categoryKey: string): Promise<{
  categoryInfo: {
    name: string
    href: string
    description: string
    defaultArticle?: string
  }
  articles: DetailedArticle[]
} | null> {
  try {
    const url = API_ROUTES.ARTICLES.GET_CATEGORY_ARTICLES(categoryKey)
    return await apiRequest<{ categoryInfo: { name: string; href: string; description: string; defaultArticle?: string }; articles: DetailedArticle[] }>(url)
  } catch (error) {
    console.error('Failed to fetch category from API:', error)
    return null
  }
}

/**
 * 从后端 API 获取内容概览
 * 生产环境使用，开发环境作为备用
 */
export async function getContentOverviewFromAPI() {
  try {
    const url = API_ROUTES.ARTICLES.GET_ARTICLES_OVERVIEW
    return await apiRequest(url)
  } catch (error) {
    console.error('Failed to fetch content overview from API:', error)
    return null
  }
}

/**
 * 导出 API 路由配置供其他模块使用
 */
// 图片相关的ISR函数
export async function revalidateImageCache(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROUTES.BASE_URL}/images/${imagePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'revalidate' })
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to revalidate image cache:', error)
    return false
  }
}

export async function clearImageCache(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROUTES.BASE_URL}/images/${imagePath}`, {
      method: 'DELETE'
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to clear image cache:', error)
    return false
  }
}

export async function getImageMetadata(imagePath: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}): Promise<{
  width: number
  height: number
  format: string
  size: number
}> {
  try {
    const searchParams = new URLSearchParams()
    
    if (options?.width) searchParams.set('w', options.width.toString())
    if (options?.height) searchParams.set('h', options.height.toString())
    if (options?.quality) searchParams.set('q', options.quality.toString())
    if (options?.format) searchParams.set('f', options.format)
    
    const url = `${API_ROUTES.BASE_URL}/images/${imagePath}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to get image metadata: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get image metadata:', error)
    // 返回默认的图片元数据
    return {
      width: 0,
      height: 0,
      format: 'unknown',
      size: 0
    }
  }
}

export { API_ROUTES }