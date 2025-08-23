import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { getArticleContent, getCategoryContent } from '@/lib/content-service'
import { getCategoryToUrlMapping } from '@/lib/category-mapping-service'
import ArticleRenderer from '@/components/article/ArticleRenderer'
import { ImageComponent } from '@/components/article/ImageComponent'
import ErrorPage from '@/components/ui/ErrorPage'

interface BlogPageProps {
  params: Promise<{
    category: string
    articles: string
  }>
}

// 生成静态参数
export async function generateStaticParams() {
  try {
    // 检查是否在构建时或开发环境
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // 通过API获取所有分类数据
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'default',
      // 在生产环境中设置超时
      ...(isProduction && { signal: AbortSignal.timeout(5000) })
    })
    
    if (!response.ok) {
      console.warn('获取静态参数的分类数据失败，返回空数组')
      return []
    }
    
    const data = await response.json()
    const params: { category: string; articles: string }[] = []
    
    // 获取动态映射
    const categoryUrlMap = await getCategoryToUrlMapping()
    
    // 遍历所有分类和文章
    const categories = data.categories || {}
    for (const [categoryKey, categoryData] of Object.entries(categories)) {
      const category = categoryData as {
        articles?: Record<string, { id: string; title: string; [key: string]: unknown }>
      }
      if (category.articles && typeof category.articles === 'object') {
        const urlPath = categoryUrlMap[categoryKey] || categoryKey
        Object.entries(category.articles).forEach(([articleId]) => {
           params.push({
             category: urlPath,
             articles: articleId
           })
         })
      }
    }
    
    console.log(`生成了 ${params.length} 个静态参数`)
    return params
  } catch (error) {
    console.warn('生成静态参数时出错，返回空数组:', (error as Error).message)
    // 在没有服务器时返回空数组，让动态路由处理
    return []
  }
}

// 生成元数据
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const article = await getArticleContent(resolvedParams.category, resolvedParams.articles)
    
    if (!article) {
      return {
        title: '文章未找到',
        description: '请求的文章不存在'
      }
    }
    
    return {
      title: `${article.title}`,
      description: article.excerpt || article.content?.substring(0, 160) || '技术博客文章',
      keywords: article.tags?.join(', ') || '技术,博客',
      authors: [{ name: article.author || 'XRAK' }],
      openGraph: {
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160),
        type: 'article',
        publishedTime: article.publishDate,
        authors: [article.author || 'XRAK'],
        tags: article.tags
      }
    }
  } catch (error) {
    console.error('生成元数据时出错:', error)
    return {
      title: '服务暂时不可用 - XRAK',
      description: '页面加载时遇到了问题，请稍后再试。',
      keywords: '技术,博客,XRAK'
    }
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  try {
    // Next.js 15: 在使用前需要先解析params参数
    const resolvedParams = await params
    
    const decodedCategory = decodeURIComponent(resolvedParams.category)
    if (resolvedParams.category.startsWith('@') || resolvedParams.category.startsWith('_') ||
        resolvedParams.category.startsWith('%40') || resolvedParams.category.startsWith('%5F') ||
        decodedCategory.startsWith('@') || decodedCategory.startsWith('_')) {
      notFound()
    }
    
    // 使用增强的内容获取服务
    const article = await getArticleContent(resolvedParams.category, resolvedParams.articles)
    const categoryContent = await getCategoryContent(resolvedParams.category)
    
    if (!article) {
      notFound()
    }
  
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
      {/* 导航面包屑 */}
      <nav className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              首页
            </Link>
            <span>/</span>
            <Link
              href={categoryContent.categoryInfo.href}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {categoryContent.categoryInfo.name}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100">{article.title}</span>
          </div>
        </div>
      </nav>
      
      {/* 文章内容 */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-lg max-w-none">
          {/* 文章头部 */}
          <header className="mb-12 border-b border-neutral-200 dark:border-neutral-700 pb-8">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded-full">
                {article.category}
              </span>
              <time className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {article.publishDate}
              </time>
            </div>
          </header>
          
          {/* 文章正文 */}
          <div className="prose-content">
            {article.structuredContent ? (
              <ArticleRenderer content={article.structuredContent} />
            ) : (
              <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold mb-4 mt-8 text-neutral-800 dark:text-neutral-200">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-medium mb-3 mt-6 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-700 dark:text-neutral-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 my-6 italic text-neutral-600 dark:text-neutral-400">
                        {children}
                      </blockquote>
                    ),
                    img: ({ src, alt }) => (
                      <ImageComponent
                        src={typeof src === 'string' ? src : ''}
                        alt={typeof alt === 'string' ? alt : ''}
                        priority={false}
                      />
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono text-neutral-800 dark:text-neutral-200">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg overflow-x-auto mb-6 border border-neutral-200 dark:border-neutral-700">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* 文章元信息 */}
            {(article.tags || article.readTime || article.author) && (
              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {article.readTime && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.readTime}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {article.author}
                    </span>
                  )}
                </div>
                {article.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
        
        {/* 文章底部导航 */}
        <footer className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <a 
              href={categoryContent.categoryInfo.href}
              className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回 {categoryContent.categoryInfo.name}
            </a>
            
            <div className="text-xs text-neutral-400 dark:text-neutral-500">
              ISR 缓存策略已启用
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
  } catch (error) {
    console.error('页面加载错误:', error)
    
    // 返回优雅的错误页面
    return <ErrorPage />
  }
}

// ISR 配置
export const revalidate = 60 // ISR revalidate time in seconds
export const dynamic = 'force-dynamic' // 强制动态渲染以确保错误恢复
export const dynamicParams = true // 允许动态参数