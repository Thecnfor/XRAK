import { NextResponse } from 'next/server'
import { ISR_CONFIG } from '@/config/isr-config'
import { getBlogData } from '@/lib/blog-data-service'

/**
 * GET /api/blog-data
 * 返回博客数据（使用模拟数据或外部API）
 */
export async function GET() {
  try {
    // 从example目录或降级数据获取博客数据
    const blogData = await getBlogData()
    
    // 模拟网络延迟
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 添加适当的缓存头
    return NextResponse.json(blogData, {
      headers: {
        'Cache-Control': `public, s-maxage=${ISR_CONFIG.BLOG_DATA.revalidate}, stale-while-revalidate=${ISR_CONFIG.BLOG_DATA.staleWhileRevalidate}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error serving blog data:', error)
    return NextResponse.json(
      { error: 'Failed to load blog data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blog-data/refresh
 * 手动刷新缓存（开发时使用）
 */
export async function POST() {
  try {
    // 在实际应用中，这里可以触发缓存刷新逻辑
    return NextResponse.json({ 
      message: 'Cache refresh triggered',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error refreshing cache:', error)
    return NextResponse.json(
      { error: 'Failed to refresh cache' },
      { status: 500 }
    )
  }
}