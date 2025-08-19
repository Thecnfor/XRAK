import { NextRequest, NextResponse } from 'next/server'
import { getCategoryContent, listAvailableContent } from '@/lib/content-service'
import { getCacheConfig } from '@/config/isr-config'

interface RouteParams {
  params: Promise<{
    category: string
  }>
}

/**
 * GET /api/content/[category]
 * 获取指定分类的所有文章内容
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { category } = await params
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      )
    }
    
    const categoryContent = await getCategoryContent(category)
    
    if (!categoryContent) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    const cacheConfig = getCacheConfig()
    
    return NextResponse.json(categoryContent, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching category content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/content/[category]
 * 获取分类的元信息（不包含文章内容）
 */
export async function OPTIONS(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { category } = await params
    const availableContent = await listAvailableContent()
    
    const hasDetailedContent = availableContent.includes(category)
    
    return NextResponse.json({
      category,
      hasDetailedContent,
      availableContent
    })
  } catch (error) {
    console.error('Error fetching category options:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}