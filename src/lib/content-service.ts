import { type BlogArticle } from './blog-data-service'

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
 * API路由配置 - 指向统一的博客API服务
 */
const API_ROUTES = {
  // 基础 API 地址（统一指向博客API服务）
  BASE_URL: 'http://localhost:8000/api',
  
  // 博客数据路由
  BLOG_DATA: {
    // 获取所有博客数据: GET http://localhost:8000/api/blog-data
    GET_ALL: 'http://localhost:8000/api/blog-data',
    // 刷新缓存: POST http://localhost:8000/api/blog-data/refresh
    REFRESH: 'http://localhost:8000/api/blog-data/refresh'
  },
  
  // 文章路由
  ARTICLES: {
    // 获取文章详情: GET http://localhost:8000/api/articles/{categoryKey}/{articleId}
    GET_ARTICLE: (categoryKey: string, articleId: string) => `http://localhost:8000/api/articles/${categoryKey}/${articleId}`,
    // 获取文章列表: GET http://localhost:8000/api/articles/{categoryKey}
    GET_ARTICLES: (categoryKey: string) => `http://localhost:8000/api/articles/${categoryKey}`
  },
  
  // 分类路由
  CATEGORIES: {
    // 获取所有分类: GET http://localhost:8000/api/categories
    GET_ALL: 'http://localhost:8000/api/categories',
    // 获取分类详情: GET http://localhost:8000/api/categories/{categoryKey}
    GET_CATEGORY: (categoryKey: string) => `http://localhost:8000/api/categories/${categoryKey}`
  },
  
  // 内容管理路由（后台使用）
  CONTENT: {
    // 预热缓存: POST http://localhost:8000/api/content/preload
    PRELOAD: 'http://localhost:8000/api/content/preload',
    // 清除缓存: DELETE http://localhost:8000/api/content/cache
    CLEAR_CACHE: 'http://localhost:8000/api/content/cache'
  }
} as const

/**
 * 获取单个文章的详细内容
 */
export async function getArticleContent(
  categoryKey: string, 
  articleId: string
): Promise<DetailedArticle | null> {
  try {
    const articleApiUrl = API_ROUTES.ARTICLES.GET_ARTICLE(categoryKey, articleId)
    const response = await fetch(articleApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 禁用缓存以确保错误恢复
      next: { revalidate: 0 } // 每次都重新验证
    })
    
    if (response.ok) {
      const responseData = await response.json()
      const articleData = responseData.data // 提取data字段
      // 转换为 DetailedArticle 格式
      return {
        title: articleData.title,
        category: articleData.category,
        publishDate: articleData.publishDate,
        content: articleData.content,
        excerpt: articleData.excerpt || articleData.content?.slice(0, 200) || '',
        imagePath: articleData.imagePath,
        tags: articleData.tags || [],
        readTime: articleData.readTime || '5分钟',
        author: articleData.author || '未知作者',
        source: '统一博客API服务',
        structuredContent: articleData.structuredContent || null
      }
    } else {
      console.error(`Failed to fetch article: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to fetch article from unified blog API:', error)
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
  
  try {
    const categoryApiUrl = API_ROUTES.CATEGORIES.GET_CATEGORY(categoryKey)
    const response = await fetch(categoryApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 禁用缓存以确保错误恢复
      next: { revalidate: 0 } // 每次都重新验证
    })
    
    if (response.ok) {
      const responseData = await response.json()
      const categoryData = responseData.data // 提取data字段
      
      // 转换文章数据为 DetailedArticle 格式
      // articles是一个对象，需要转换为数组
      const articles: DetailedArticle[] = Object.values(categoryData.articles || {}).map((article) => {
         const typedArticle = article as {
           id?: string;
           title: string;
           category?: string;
           publishDate: string;
           content: string;
           excerpt?: string;
           imagePath?: string;
           tags?: string[];
           readTime?: string;
           author?: string;
         }
         return {
           title: typedArticle.title,
           category: typedArticle.category || categoryKey,
           publishDate: typedArticle.publishDate,
           content: typedArticle.content,
           excerpt: typedArticle.excerpt || typedArticle.content?.slice(0, 200) || '',
           imagePath: typedArticle.imagePath,
           tags: typedArticle.tags || [],
           readTime: typedArticle.readTime || '5分钟',
           author: typedArticle.author || '未知作者',
           source: '统一博客API服务'
         }
       })
      
      return {
        categoryInfo: {
          name: categoryData.title,
          href: categoryData.href,
          description: categoryData.description || '',
          defaultArticle: categoryData.defaultArticle
        },
        articles
      }
    } else {
      console.error(`Failed to fetch category: ${response.status} ${response.statusText}`)
      throw new Error(`Category ${categoryKey} not found`)
    }
  } catch (error) {
    console.error('Failed to fetch category from unified blog API:', error)
    throw new Error(`Failed to load category ${categoryKey}`)
  }
}

export { API_ROUTES }