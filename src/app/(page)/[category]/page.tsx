import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryFromUrl, getAvailableCategories } from '@/lib/category-mapping-service'
import { getBlogData as getBlogDataFromService } from '@/lib/blog-data-service'

// 动态映射已移至 category-mapping-service
interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

// 使用统一的博客数据服务
const getBlogData = getBlogDataFromService

// 生成元数据
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryKey = await getCategoryFromUrl(category)
  
  if (!categoryKey) {
    return {
      title: '分类未找到 - XRAK',
      description: '请求的分类不存在'
    }
  }

  const blogData = await getBlogData()
  const categoryData = blogData.blogInfoPool[categoryKey]
  
  if (!categoryData) {
    return {
      title: '分类未找到 - XRAK',
      description: '请求的分类不存在'
    }
  }

  return {
    title: `${categoryData.categoryInfo.name} - XRAK`,
    description: categoryData.categoryInfo.description,
    openGraph: {
      title: `${categoryData.categoryInfo.name} - XRAK`,
      description: categoryData.categoryInfo.description,
      type: 'website'
    }
  }
}

// 生成静态参数
export async function generateStaticParams() {
  const { urlPaths } = await getAvailableCategories()
  return urlPaths.map((category) => ({
    category
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  
  // 过滤特殊路径（如Vite开发工具请求）
  // 处理URL编码的情况，如 %40vite -> @vite
  const decodedCategory = decodeURIComponent(category)
  if (category.startsWith('@') || category.startsWith('_') ||
      category.startsWith('%40') || category.startsWith('%5F') ||
      decodedCategory.startsWith('@') || decodedCategory.startsWith('_')) {
    notFound()
  }
  
  const categoryKey = await getCategoryFromUrl(category)
  
  if (!categoryKey) {
    notFound()
  }

  const blogData = await getBlogData()
  const categoryData = blogData.blogInfoPool[categoryKey]
  
  if (!categoryData) {
    notFound()
  }

  const { categoryInfo, articles } = categoryData
  const articleEntries = articles ? Object.entries(articles) : []

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* 页面头部 */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {categoryInfo.name}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {categoryInfo.description}
            </p>
            {articleEntries.length > 0 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                共 {articleEntries.length} 篇文章
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {articleEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                暂无文章
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                该分类下还没有发布任何文章
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {articleEntries.map(([articleId, article]) => {
              const articleHref = `${categoryInfo.href}/${articleId}`
              
              return (
                <article key={articleId} className="group">
                  <Link href={articleHref} className="block">
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                            {article.title}
                          </h2>
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {article.publishDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {article.category}
                          </span>
                        </div>
                        
                        {article.content && typeof article.content === 'string' && (
                          <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {article.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* 返回首页链接 */}
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

// 启用静态生成
export const dynamic = 'force-static'
export const revalidate = 3600 // 1小时重新验证