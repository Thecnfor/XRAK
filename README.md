# XRAK 博客系统 - API 对接文档

## 项目概述

**XRAK** 是基于 Next.js 15.4.6 构建的现代化博客系统，采用 App Router + RSC 架构，支持 ISR（增量静态再生）和动态映射技术。

### 技术栈
- **框架**: Next.js 15.4.6 (App Router + RSC)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **部署**: Vercel (推荐)
- **性能目标**: Lighthouse ≥90分

### 核心特性
- ✅ **ISR增量更新**: 60秒重新验证，智能缓存策略
- ✅ **动态映射架构**: 自动生成URL到分类的双向映射
- ✅ **图片优化**: WebP/AVIF自动转换，响应式尺寸
- ✅ **暗黑模式**: 完整的明亮/暗黑主题支持
- ✅ **响应式设计**: 移动端和桌面端适配
- ✅ **安全优化**: 依赖漏洞扫描，CSP配置

---

## API 端点规范

### 1. 博客数据管理 (ISR)

#### GET `/api/blog-data`
**描述**: 获取博客数据，支持ISR缓存

**请求方式**: `GET`

**缓存策略**: 
```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

**响应格式**:
```json
{
  "categories": {
    "tech": {
      "title": "技术分享",
      "href": "/tech",
      "hasSubmenu": true,
      "defaultArticle": "/tech/1",
      "articles": {
        "1": {
          "id": "1",
          "title": "文章标题",
          "publishDate": "2024-01-01",
          "content": "文章内容",
          "blocks": []
        }
      }
    },
    "XRAK": {
      "title": "个人简介",
      "href": "/me",
      "hasSubmenu": false,
      "defaultArticle": "/me"
    }
  }
}
```

#### POST `/api/blog-data/refresh`
**描述**: 手动刷新博客数据缓存

**请求方式**: `POST`

**认证**: Bearer token (生产环境)

**请求头**:
```http
Authorization: Bearer {CACHE_REFRESH_TOKEN}
Content-Type: application/json
```

**响应格式**:
```json
{
  "success": true,
  "message": "缓存已刷新",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. 分类映射管理

#### GET `/api/categories/mappings`
**描述**: 获取分类映射数据

**查询参数**:
- `type`: 映射类型 (`url-to-category` | `category-to-url` | `all`)
- `refresh`: 是否强制刷新缓存 (`true` | `false`)

**响应格式**:
```json
{
  "urlToCategory": {
    "tech": "技术分享",
    "ai": "人工智能"
  },
  "categoryToUrl": {
    "技术分享": "tech",
    "人工智能": "ai"
  },
  "metadata": {
    "lastUpdated": "2024-01-01T00:00:00Z",
    "cacheHit": true
  }
}
```

#### POST `/api/categories/mappings`
**描述**: 刷新或清除映射缓存

**请求体**:
```json
{
  "action": "refresh" | "clear",
  "force": true
}
```

### 3. 内容卡片管理 (ISR)

#### GET `/api/content-cards`
**描述**: 获取内容卡片数据，支持ISR缓存

**查询参数**:
- `type`: 卡片类型 (`recommend` | `news` | `project` | `all`)
- `limit`: 返回数量限制

**响应格式**:
```json
{
  "recommend": [
    {
      "title": "推荐文章标题",
      "category": "tech",
      "publishDate": "2024-01-01",
      "content": "文章摘要"
    }
  ],
  "news": [],
  "project": []
}
```

### 4. 图片优化 (ISR)

#### GET `/api/images/[...path]`
**描述**: 图片ISR优化接口

**路径参数**: `path` - 图片路径数组

**查询参数**:
- `w`: 宽度
- `q`: 质量 (1-100)
- `format`: 格式 (`webp` | `avif` | `jpeg`)

**缓存策略**:
```typescript
{
  revalidate: 3600,              // 1小时重新验证
  staleWhileRevalidate: 86400,   // 24小时过期
  maxAge: 31536000,              // 1年最大缓存
  formats: ['webp', 'avif', 'jpeg']
}
```

---

## 数据结构规范

### 文章内容块 (ContentBlock)

```typescript
export interface ContentBlock {
  id: string
  type: 'title' | 'content' | 'code' | 'image' | 'double-image' | 'image-text'
  data: {
    // 通用字段
    text?: string
    level?: number
    content?: string
    
    // 代码组件字段
    code?: string
    language?: string
    
    // 图片组件字段
    src?: string
    alt?: string
    caption?: string
    priority?: boolean
    quality?: number
    width?: number
    height?: number
    
    // 双图片组件字段
    leftImage?: ImageData
    rightImage?: ImageData
    
    // 图文组件字段
    image?: ImageData
  }
}

interface ImageData {
  src: string
  alt: string
  caption?: string
  priority?: boolean
  quality?: number
}
```

### 文章数据结构

```typescript
export interface Article {
  id: string
  title: string
  meta: {
    author: string
    date: string
    category: string
    tags: string[]
  }
  blocks: ContentBlock[]
}
```

### 导航数据结构

```typescript
export interface NavigationItem {
  title: string
  href: string
  hasSubmenu: boolean
  defaultArticle?: string
  articles?: Record<string, Article>
}
```

---

## 组件类型规范

### 1. 文本类组件

#### 标题组件 (title)
```json
{
  "id": "unique-id",
  "type": "title",
  "data": {
    "text": "标题文本",
    "level": 2
  }
}
```

#### 内容组件 (content)
```json
{
  "id": "unique-id",
  "type": "content",
  "data": {
    "content": "文本内容\n\n支持多段落"
  }
}
```

### 2. 代码类组件

#### 代码组件 (code)
```json
{
  "id": "unique-id",
  "type": "code",
  "data": {
    "code": "console.log('Hello World');",
    "language": "javascript"
  }
}
```

### 3. 图片类组件

#### 全宽图片组件 (image)
```json
{
  "id": "unique-id",
  "type": "image",
  "data": {
    "src": "/images/example.jpg",
    "alt": "图片描述",
    "caption": "图片说明",
    "priority": false,
    "quality": 75,
    "width": 1200,
    "height": 800
  }
}
```

#### 双列图片组件 (double-image)
```json
{
  "id": "unique-id",
  "type": "double-image",
  "data": {
    "leftImage": {
      "src": "/images/left.jpg",
      "alt": "左侧图片描述",
      "caption": "左侧图片说明"
    },
    "rightImage": {
      "src": "/images/right.jpg",
      "alt": "右侧图片描述",
      "caption": "右侧图片说明"
    }
  }
}
```

#### 图文混排组件 (image-text)
```json
{
  "id": "unique-id",
  "type": "image-text",
  "data": {
    "image": {
      "src": "/images/example.jpg",
      "alt": "图片描述",
      "caption": "图片说明"
    },
    "content": "右侧文字内容\n\n支持多段落"
  }
}
```

---

## 环境变量配置

### 基础配置
```bash
# .env.local

# API基础配置
API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ISR配置
BLOG_API_URL=http://localhost:8000/api/blog-data
ISR_REVALIDATE_TIME=60
ISR_STALE_TIME=300
CACHE_REFRESH_TOKEN=your-secret-token

# 图片优化配置
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
IMAGE_OPTIMIZATION_ENABLED=true
ISR_SECRET=your-isr-secret
```

### 映射缓存配置
```bash
# 映射缓存配置
MAPPING_CACHE_TTL=3600
MAPPING_ENABLE_MEMORY_CACHE=true
MAPPING_ENABLE_API_CACHE=true

# 数据源配置
MAPPING_PRIMARY_SOURCE=blog-data-json
MAPPING_FALLBACK_SOURCE=default-mappings
MAPPING_REFRESH_INTERVAL=300

# 开发配置
MAPPING_DEBUG_LOGS=true
MAPPING_AUTO_REFRESH=true
MAPPING_HOT_RELOAD=true
```

---

## 部署配置

### Vercel 配置 (推荐)

创建 `vercel.json` 文件:
```json
{
  "functions": {
    "app/api/images/[...path]/route.ts": {
      "maxDuration": 10
    }
  },
  "images": {
    "domains": ["example.com"],
    "formats": ["image/webp", "image/avif"]
  }
}
```

### Next.js 配置

`next.config.ts` 关键配置:
```typescript
const nextConfig = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  experimental: {
    isrMemoryCacheSize: 0
  }
}
```

---

## 集成指南

### 1. 后端开发者集成步骤

1. **数据源准备**
   - 准备符合 `NavigationItem` 结构的博客数据
   - 确保所有文章包含完整的 `ContentBlock` 数组
   - 图片资源使用相对路径或CDN地址

2. **API实现**
   - 实现 `/api/blog-data` 端点，返回标准格式数据
   - 配置适当的缓存头部
   - 实现缓存刷新机制

3. **环境配置**
   - 设置必要的环境变量
   - 配置图片域名白名单
   - 设置ISR重新验证时间

### 2. 数据验证规则

- 所有 `id` 字段必须全局唯一
- `type` 字段必须为预定义类型之一
- 必需字段不能为空或undefined
- 图片URL必须可访问
- 日期格式使用 ISO 8601 标准

### 3. 性能优化建议

- 图片大小控制在 500KB 以内
- 使用 WebP 格式优先
- 合理设置图片优先级 (`priority`)
- 避免过深的组件嵌套
- 使用适当的缓存策略

---

## 错误处理

### 标准错误响应格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 常见错误码

- `INVALID_REQUEST`: 请求参数无效
- `UNAUTHORIZED`: 认证失败
- `NOT_FOUND`: 资源不存在
- `CACHE_ERROR`: 缓存操作失败
- `MAPPING_ERROR`: 映射服务错误
- `IMAGE_OPTIMIZATION_ERROR`: 图片优化失败

---

## 安全措施

### 1. 依赖安全
```bash
# 定期执行依赖漏洞扫描
npm audit
npm audit fix
```

### 2. 内容安全策略 (CSP)
```http
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

### 3. 环境变量隔离
- 敏感信息存储在 `.env.local`
- 生产环境使用环境变量管理
- 定期轮换API密钥和令牌

---

## 开发工具

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 构建生产版本
```bash
npm run build
npm start
```

### 性能分析
```bash
# Lighthouse CI
npm run lighthouse

# Bundle 分析
npm run analyze
```

---

## 技术支持

### 文档版本
- **版本**: v2.0.0
- **最后更新**: 2024-12-19
- **维护者**: XRAK 开发团队

### 相关资源
- [Next.js 官方文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vercel 部署指南](https://vercel.com/docs)

### 问题反馈
如遇到集成问题，请提供以下信息：
- 错误日志和堆栈跟踪
- 环境配置信息
- 复现步骤
- 预期行为描述

---

## 导航系统与ISR集成

### 导航数据API

**端点**: `GET /api/navigation`

**功能**: 提供导航菜单数据，支持ISR增量更新

**ISR配置**:
```typescript
{
  revalidate: 60,                // 60秒重新验证
  staleWhileRevalidate: 300,     // 5分钟过期
  dynamic: 'force-static',       // 强制静态生成
  cache: 'public, s-maxage=60, stale-while-revalidate=300'
}
```

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "title": "个人简介",
      "href": "/me",
      "hasSubmenu": false,
      "defaultArticle": "/me",
      "articles": []
    },
    {
      "title": "技术",
      "href": "/tech",
      "hasSubmenu": true,
      "defaultArticle": "/tech/nextjs-guide",
      "articles": [
        {
          "title": "Next.js 15 开发指南",
          "category": "技术",
          "publishDate": "2024-01-15",
          "content": "Next.js",
          "source": "api"
        }
      ]
    }
  ],
  "timestamp": "2025-08-19T13:54:40.400Z"
}
```

### 导航Hook使用

**useNavigationData Hook**:
```typescript
const {
  navigationData,    // 导航数据数组
  isLoading,        // 加载状态
  hasError,         // 错误状态
  refetch,          // 重新获取函数
  cacheStatus,      // 缓存状态
  isStale,          // 数据是否过期
  refreshCache      // 刷新缓存函数
} = useNavigationData()
```

**useNavigationItems Hook**:
```typescript
const { simpleItems, submenuItems } = useNavigationItems(navigationData)
```

### ISR缓存管理

**手动刷新缓存**:
```bash
# 刷新导航缓存
curl -X POST "http://localhost:3000/api/revalidate?path=/api/navigation"

# 刷新博客数据缓存
curl -X POST "http://localhost:3000/api/revalidate?path=/api/blog-data"
```

**自动缓存检测**:
- 每5秒检查缓存状态
- 自动检测数据过期
- 支持后台增量更新
- 错误时自动降级到本地数据

### 生产环境优化

**构建优化**:
- 静态预渲染导航页面
- ISR增量更新支持
- 自动代码分割
- 缓存策略优化

**性能指标**:
- 首次加载: < 171KB
- 导航切换: < 3KB
- 缓存命中率: > 95%
- 更新延迟: < 60秒

---

**注意**: 本文档基于 Next.js 15.4.6 和最新的 App Router 架构编写，确保您的开发环境版本兼容。
