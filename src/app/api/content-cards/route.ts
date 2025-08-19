import { NextRequest, NextResponse } from 'next/server';
import { getAllClassifiedCardData, getClassifiedCacheStatus } from '@/lib/content-classifier';
import { ISR_CONFIG } from '@/config/isr-config';

/**
 * GET /api/content-cards
 * 获取所有分类的卡片数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCache = searchParams.get('includeCache') === 'true';
    
    // 获取分类卡片数据
    const cardData = await getAllClassifiedCardData();
    
    // 构建响应数据
    const responseData = {
      data: cardData,
      timestamp: new Date().toISOString(),
      ...(includeCache && { cache: getClassifiedCacheStatus() })
    };
    
    // 设置缓存头
    const response = NextResponse.json(responseData);
    
    // 设置ISR相关的缓存控制头
    response.headers.set(
      'Cache-Control',
      `s-maxage=${ISR_CONFIG.BLOG_DATA.revalidate}, stale-while-revalidate=${ISR_CONFIG.BLOG_DATA.staleWhileRevalidate}`
    );
    
    // 设置CORS头（如果需要）
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    
    return response;
    
  } catch (error) {
    console.error('Content cards API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch content cards',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content-cards/refresh
 * 强制刷新卡片数据缓存
 */
export async function POST(request: NextRequest) {
  try {
    const { clearClassifiedCache } = await import('@/lib/content-classifier');
    
    // 清除缓存
    clearClassifiedCache();
    
    // 重新获取数据
    const cardData = await getAllClassifiedCardData();
    
    return NextResponse.json({
      message: 'Cache refreshed successfully',
      data: cardData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Content cards refresh error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to refresh content cards cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/content-cards
 * 处理CORS预检请求
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}