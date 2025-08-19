import { NextRequest, NextResponse } from 'next/server'
import { getArticleContent } from '@/lib/content-service'
import { getCacheConfig } from '@/config/isr-config'

interface RouteParams {
  params: Promise<{
    category: string
    article: string
  }>
}

/**
 * GET /api/content/[category]/[article]
 * 获取指定文章的详细内容
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { category, article } = await params
    
    if (!category || !article) {
      return NextResponse.json(
        { error: 'Category and article parameters are required' },
        { status: 400 }
      )
    }
    
    const articleContent = await getArticleContent(category, article)
    
    if (!articleContent) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    const cacheConfig = getCacheConfig()
    
    return NextResponse.json(articleContent, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching article content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * HEAD /api/content/[category]/[article]
 * 检查文章是否存在（用于预检查）
 */
export async function HEAD(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { category, article } = await params
    const articleContent = await getArticleContent(category, article)
    
    if (!articleContent) {
      return new NextResponse(null, { status: 404 })
    }
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}