import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * ISR重新验证API端点
 * 支持按路径和标签重新验证缓存
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')
    const secret = searchParams.get('secret')
    
    // 验证密钥（可选，用于生产环境安全）
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      )
    }
    
    if (path) {
      // 按路径重新验证
      console.log(`Revalidating path: ${path}`)
      revalidatePath(path)
      
      return NextResponse.json({
        success: true,
        message: `Path ${path} revalidated successfully`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (tag) {
      // 按标签重新验证
      console.log(`Revalidating tag: ${tag}`)
      revalidateTag(tag)
      
      return NextResponse.json({
        success: true,
        message: `Tag ${tag} revalidated successfully`,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Missing path or tag parameter',
        usage: 'POST /api/revalidate?path=/api/navigation or POST /api/revalidate?tag=navigation'
      },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Revalidation error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET方法用于健康检查
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Revalidate API is working',
    usage: {
      path: 'POST /api/revalidate?path=/api/navigation',
      tag: 'POST /api/revalidate?tag=navigation',
      secret: 'Add &secret=your_secret for production security'
    },
    timestamp: new Date().toISOString()
  })
}