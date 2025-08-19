import { NextRequest, NextResponse } from 'next/server'
import { 
  getUrlToCategoryMapping, 
  getCategoryToUrlMapping, 
  refreshCategoryMappings,
  getAvailableCategories,
  clearCategoryMappingCache
} from '@/lib/category-mapping-service'
import { getCacheConfig } from '@/config/isr-config'

/**
 * GET /api/categories/mappings
 * 获取分类映射信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'url-to-category' | 'category-to-url' | 'all' | 'available'
    
    const cacheConfig = getCacheConfig()
    
    // 设置缓存头
    const headers = {
      'Cache-Control': `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.revalidate * 2}`,
      'Content-Type': 'application/json'
    }

    switch (type) {
      case 'url-to-category': {
        const mapping = await getUrlToCategoryMapping()
        return NextResponse.json({ 
          success: true, 
          data: { urlToCategory: mapping },
          timestamp: new Date().toISOString()
        }, { headers })
      }
      
      case 'category-to-url': {
        const mapping = await getCategoryToUrlMapping()
        return NextResponse.json({ 
          success: true, 
          data: { categoryToUrl: mapping },
          timestamp: new Date().toISOString()
        }, { headers })
      }
      
      case 'available': {
        const available = await getAvailableCategories()
        return NextResponse.json({ 
          success: true, 
          data: available,
          timestamp: new Date().toISOString()
        }, { headers })
      }
      
      default: {
        // 返回所有映射信息
        const [urlToCategory, categoryToUrl, available] = await Promise.all([
          getUrlToCategoryMapping(),
          getCategoryToUrlMapping(),
          getAvailableCategories()
        ])
        
        return NextResponse.json({ 
          success: true, 
          data: {
            urlToCategory,
            categoryToUrl,
            available
          },
          timestamp: new Date().toISOString()
        }, { headers })
      }
    }
  } catch (error) {
    console.error('Failed to get category mappings:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get category mappings',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories/mappings
 * 刷新分类映射缓存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action } = body // 'refresh' | 'clear'
    
    switch (action) {
      case 'clear': {
        clearCategoryMappingCache()
        return NextResponse.json({ 
          success: true, 
          message: 'Category mapping cache cleared',
          timestamp: new Date().toISOString()
        })
      }
      
      case 'refresh':
      default: {
        await refreshCategoryMappings()
        
        // 获取更新后的映射信息
        const [urlToCategory, categoryToUrl] = await Promise.all([
          getUrlToCategoryMapping(),
          getCategoryToUrlMapping()
        ])
        
        return NextResponse.json({ 
          success: true, 
          message: 'Category mappings refreshed successfully',
          data: {
            urlToCategory,
            categoryToUrl
          },
          timestamp: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    console.error('Failed to refresh category mappings:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh category mappings',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/categories/mappings
 * CORS 预检请求支持
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}