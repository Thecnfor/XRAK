import type { ContentCardData } from '@/components/layout/content-card'
import { getBlogData } from './blog-data-service'
import { ISR_CONFIG } from '@/config/isr-config'

// 内存缓存
let cachedClassifiedData: {
  recommendCardData: ContentCardData[]
  newsCardData: ContentCardData[]
  projectCardData: ContentCardData[]
} | null = null
let cacheTimestamp: number = 0

/**
 * 检查分类数据缓存是否有效
 */
function isClassifiedCacheValid(): boolean {
  if (!cachedClassifiedData || !cacheTimestamp) return false
  const cacheAge = (Date.now() - cacheTimestamp) / 1000
  return cacheAge < ISR_CONFIG.BLOG_DATA.revalidate
}

/**
 * 从博客数据池中提取所有文章
 */
async function extractAllArticles(): Promise<ContentCardData[]> {
  const blogData = await getBlogData()
  const blogPool = blogData.blogInfoPool
  const articles: ContentCardData[] = []
  
  Object.entries(blogPool).forEach(([, categoryData]) => {
    if (categoryData.articles) {
      const categoryHref = categoryData.categoryInfo.href
      Object.entries(categoryData.articles).forEach(([articleId, article]) => {
        articles.push({
          title: article.title,
          category: article.category,
          publishDate: article.publishDate,
          content: article.content,
          href: `${categoryHref}/${articleId}`,
          imagePath: article.imagePath
        })
      })
    }
  })
  
  return articles
}

/**
 * 解析发布日期为可比较的数值
 */
function parseDateString(dateStr: string): number {
  // 提取"发布于X月X号"中的月份和日期
  const match = dateStr.match(/发布于(\d+)月(\d+)号/)
  if (match) {
    const month = parseInt(match[1])
    const day = parseInt(match[2])
    // 假设都是当年，用月份*100+日期作为排序依据
    return month * 100 + day
  }
  return 0
}

/**
 * 随机打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 生成推荐卡片数据（3条随机内容）
 */
export async function generateRecommendCardData(): Promise<ContentCardData[]> {
  const allArticles = await extractAllArticles()
  const shuffled = shuffleArray(allArticles)
  return shuffled.slice(0, 3)
}

/**
 * 生成最新卡片数据（6条内容，按时间倒序排列）
 */
export async function generateNewsCardData(): Promise<ContentCardData[]> {
  const allArticles = await extractAllArticles()
  
  // 按发布时间倒序排序（最新的在前）
  const sorted = allArticles.sort((a, b) => {
    const dateA = parseDateString(a.publishDate)
    const dateB = parseDateString(b.publishDate)
    return dateB - dateA // 倒序
  })
  
  return sorted.slice(0, 6)
}

/**
 * 生成精选项目卡片数据（随机显示）
 */
export async function generateProjectCardData(): Promise<ContentCardData[]> {
  const allArticles = await extractAllArticles()
  const shuffled = shuffleArray(allArticles)
  return shuffled.slice(0, 6)
}

/**
 * 获取所有分类后的卡片数据（带缓存支持）
 */
export async function getAllClassifiedCardData() {
  // 检查缓存是否有效
  if (isClassifiedCacheValid()) {
    return cachedClassifiedData!
  }
  
  try {
    // 生成新的分类数据
    const [recommendCardData, newsCardData, projectCardData] = await Promise.all([
      generateRecommendCardData(),
      generateNewsCardData(),
      generateProjectCardData()
    ])
    
    const result = {
      recommendCardData,
      newsCardData,
      projectCardData
    }
    
    // 更新缓存
    cachedClassifiedData = result
    cacheTimestamp = Date.now()
    
    return result
  } catch (error) {
    console.error('Failed to generate classified card data:', error)
    
    // 如果有缓存数据，返回缓存（即使过期）
    if (cachedClassifiedData) {
      console.warn('Using stale classified data due to generation error')
      return cachedClassifiedData
    }
    
    // 返回空数据作为降级
    return {
      recommendCardData: [],
      newsCardData: [],
      projectCardData: []
    }
  }
}

/**
 * 清除分类数据缓存
 */
export function clearClassifiedCache(): void {
  cachedClassifiedData = null
  cacheTimestamp = 0
}

/**
 * 获取分类数据缓存状态
 */
export function getClassifiedCacheStatus() {
  return {
    hasCachedData: !!cachedClassifiedData,
    cacheTimestamp,
    isValid: isClassifiedCacheValid(),
    cacheAge: cacheTimestamp ? (Date.now() - cacheTimestamp) / 1000 : 0
  }
}