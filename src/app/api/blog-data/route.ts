import { NextResponse } from 'next/server'
import blogData from '../../../../docs/blog-data.json'

/**
 * GET /api/blog-data
 * 返回博客数据（开发环境使用本地JSON文件）
 */
export async function GET() {
  try {
    // 在开发环境中，直接返回本地JSON数据
    // 添加适当的缓存头
    return NextResponse.json(blogData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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