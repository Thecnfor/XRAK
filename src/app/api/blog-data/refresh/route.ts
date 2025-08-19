import { NextRequest, NextResponse } from 'next/server'
import { refreshBlogDataCache, getCacheStatus } from '@/lib/blog-data-service'

/**
 * POST /api/blog-data/refresh
 * 手动刷新博客数据缓存
 */
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加API密钥验证）
    const authHeader = request.headers.get('authorization')
    const isDev = process.env.NODE_ENV === 'development'
    
    // 在生产环境中可以添加API密钥验证
    if (!isDev && (!authHeader || authHeader !== `Bearer ${process.env.CACHE_REFRESH_TOKEN}`)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 获取刷新前的缓存状态
    const beforeStatus = getCacheStatus()
    
    // 强制刷新缓存
    const refreshedData = await refreshBlogDataCache()
    
    // 获取刷新后的缓存状态
    const afterStatus = getCacheStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Blog data cache refreshed successfully',
      timestamp: new Date().toISOString(),
      cacheStatus: {
        before: beforeStatus,
        after: afterStatus
      },
      dataInfo: {
        categoriesCount: Object.keys(refreshedData.blogInfoPool).length,
        totalArticles: Object.values(refreshedData.blogInfoPool)
          .reduce((total, category) => {
            return total + (category.articles ? Object.keys(category.articles).length : 0)
          }, 0)
      }
    })
  } catch (error) {
    console.error('Error refreshing blog data cache:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/blog-data/refresh
 * 获取当前缓存状态
 */
export async function GET() {
  try {
    const cacheStatus = getCacheStatus()
    
    return NextResponse.json({
      cacheStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Error getting cache status:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to get cache status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}