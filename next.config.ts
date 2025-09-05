import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    // 允许的图片域名
    domains: [
      'localhost',
      'example.com',
      'cdn.example.com'
    ],
    // 图片格式优化
    formats: ['image/webp', 'image/avif'],
    // 图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小缓存时间（秒）
    minimumCacheTTL: 60,
    // 危险的允许SVG
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // 实验性功能
  experimental: {
    // 启用静态生成优化
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // 编译配置
  compiler: {
    // 移除console.log（生产环境）
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // 重写规则
  async rewrites() {
    return [
      {
        source: '/api/images/:path*',
        destination: '/api/images/:path*'
      }
    ]
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
