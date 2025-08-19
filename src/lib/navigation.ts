import { getBlogData, type BlogCategory, type BlogArticle as Article } from './blog-data-service'

export interface CategoryInfo {
  name: string
  href: string
  description: string
  defaultArticle?: string
}

export type { Article }

export interface NavigationItem {
  title: string
  href: string
  hasSubmenu: boolean
  defaultArticle?: string
  articles?: Article[]
}

/**
 * 获取导航数据
 */
export async function getNavigationData(): Promise<NavigationItem[]> {
  const blogData = await getBlogData()
  const { blogInfoPool } = blogData
  
  return Object.entries(blogInfoPool).map(([_key, category]) => {
    const { categoryInfo, articles } = category as BlogCategory
    
    return {
      title: categoryInfo.name,
      href: categoryInfo.href,
      hasSubmenu: !!articles && Object.keys(articles).length > 0,
      defaultArticle: categoryInfo.defaultArticle,
      articles: articles ? Object.values(articles) : undefined
    }
  })
}

/**
 * 获取指定分类的文章列表
 */
export async function getCategoryArticles(categoryKey: string): Promise<Article[]> {
  const blogData = await getBlogData()
  const { blogInfoPool } = blogData
  const category = blogInfoPool[categoryKey] as BlogCategory
  
  if (!category?.articles) {
    return []
  }
  
  return Object.values(category.articles)
}

/**
 * 获取单级导航项（没有子菜单的）
 */
export async function getSimpleNavigationItems(): Promise<NavigationItem[]> {
  const navigationData = await getNavigationData()
  return navigationData.filter(item => !item.hasSubmenu)
}

/**
 * 获取二级导航项（有子菜单的）
 */
export async function getSubmenuNavigationItems(): Promise<NavigationItem[]> {
  const navigationData = await getNavigationData()
  return navigationData.filter(item => item.hasSubmenu)
}