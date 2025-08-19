import { NextRequest, NextResponse } from 'next/server'
import { getNavigationData } from '@/lib/navigation'
import { getCacheConfig } from '@/config/isr-config'

/**
 * 导航数据API路由
 * 提供导航数据并支持ISR缓存
 */
export async function GET() {
  try {
    const cacheConfig = getCacheConfig()
    
    // 获取导航数据
    const navigationData = await getNavigationData()
    
    return NextResponse.json(
      {
        success: true,
        data: navigationData,
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`,
        },
      }
    )
  } catch (error) {
    console.error('Navigation API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch navigation data',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}

// ISR配置
export const revalidate = 60 // 60秒重新验证
export const dynamic = 'force-static' // 强制静态生成
export const dynamicParams = true // 允许动态参数