import { NextResponse } from 'next/server'

/**
 * 健康检查API端点
 * 用于检测后端服务器是否可用
 */
export async function GET() {
  try {
    // 尝试连接后端服务器
    const response = await fetch('http://localhost:8000/api/categories', {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5秒超时
    })
    
    if (response.ok) {
      return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() })
    } else {
      return NextResponse.json(
        { status: 'unhealthy', error: 'Backend server not responding' },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

// 支持HEAD请求用于快速检查
export async function HEAD() {
  try {
    const response = await fetch('http://localhost:8000/api/categories', {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 503 })
    }
  } catch {
    // 忽略错误，但返回503状态码
    return new NextResponse(null, { status: 503 })
  }
}