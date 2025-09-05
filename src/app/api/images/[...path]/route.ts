import { NextRequest, NextResponse } from 'next/server'
import { getImageCacheConfig, getImageCacheKey } from '@/config/isr-config'
import { unstable_cache } from 'next/cache'

/**
 * 图片API路由 - 支持ISR增量更新
 * 处理图片的缓存、优化和增量更新
 */

// 图片缓存配置
const imageConfig = getImageCacheConfig()

// 缓存图片元数据
const getCachedImageMetadata = unstable_cache(
  async (src: string) => {
    try {
      // 这里可以添加图片元数据获取逻辑
      // 例如：从外部API获取图片信息、尺寸等
      const response = await fetch(src, { method: 'HEAD' })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image metadata: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      const lastModified = response.headers.get('last-modified')
      
      return {
        contentType,
        contentLength: contentLength ? parseInt(contentLength) : null,
        lastModified,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching image metadata:', error)
      return null
    }
  },
  ['image-metadata'],
  {
    revalidate: imageConfig.revalidate,
    tags: ['images']
  }
)

// GET 请求处理器
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const imagePath = path.join('/')
    const searchParams = request.nextUrl.searchParams
    
    // 获取查询参数
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : imageConfig.quality.default
    const format = searchParams.get('f') || 'webp'
    
    // 验证参数
    if (quality < 1 || quality > 100) {
      return NextResponse.json(
        { error: 'Quality must be between 1 and 100' },
        { status: 400 }
      )
    }
    
    if (!imageConfig.supportedFormats.includes(format as "webp" | "avif" | "jpeg" | "png" | "svg")) {
      return NextResponse.json(
        { error: `Unsupported format: ${format}` },
        { status: 400 }
      )
    }
    
    // 生成缓存键
    const cacheKey = getImageCacheKey(imagePath, { width, height, quality })
    
    // 获取图片元数据（带缓存）
    const metadata = await getCachedImageMetadata(imagePath)
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Image not found or inaccessible' },
        { status: 404 }
      )
    }
    
    // 返回图片元数据
    return NextResponse.json(
      {
        path: imagePath,
        metadata,
        cacheKey,
        optimizations: {
          width,
          height,
          quality,
          format
        },
        cacheConfig: {
          revalidate: imageConfig.revalidate,
          staleWhileRevalidate: imageConfig.staleWhileRevalidate,
          maxAge: imageConfig.maxAge
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${imageConfig.maxAge}, stale-while-revalidate=${imageConfig.staleWhileRevalidate}`,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST 请求处理器 - 用于手动触发缓存更新
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const imagePath = path.join('/')
    const body = await request.json()
    
    // 验证请求体
    if (!body.action || body.action !== 'revalidate') {
      return NextResponse.json(
        { error: 'Invalid action. Use "revalidate" to update cache.' },
        { status: 400 }
      )
    }
    
    // 这里可以添加权限验证
    // 例如：检查API密钥或用户权限
    
    // 手动重新验证缓存
    // 注意：这需要Next.js 14+的revalidateTag功能
    const { revalidateTag } = await import('next/cache')
    revalidateTag('images')
    
    return NextResponse.json(
      {
        message: 'Cache revalidation triggered',
        path: imagePath,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in image revalidation:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}

// DELETE 请求处理器 - 用于清除特定图片缓存
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const imagePath = path.join('/')
    
    // 这里可以添加权限验证
    // 例如：检查API密钥或用户权限
    
    // 清除特定图片的缓存
    const { revalidateTag } = await import('next/cache')
    revalidateTag('images')
    
    return NextResponse.json(
      {
        message: 'Image cache cleared',
        path: imagePath,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error clearing image cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}