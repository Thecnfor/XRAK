# API 依赖文档

## 项目概述
- **项目名称**: XRAK
- **版本**: 1.0.0
- **架构**: Next.js App Router + RSC
- **缓存策略**: ISR (Incremental Static Regeneration)

## API 接口清单

### 1. 导航数据 API
- **路径**: `/api/navigation`
- **方法**: GET
- **描述**: 获取网站导航菜单数据
- **ISR配置**: 
  - 重新验证时间: 60秒 (开发) / 300秒 (生产)
  - 过期时间: 300秒 (开发) / 1800秒 (生产)
- **依赖组件**:
  - `src/components/layout/Home.tsx`
  - `src/hooks/useNavigationData.ts`
- **缓存键**: `navigation-data`

### 2. 内容卡片 API
- **路径**: `/api/content-cards`
- **方法**: GET
- **描述**: 获取所有分类的内容卡片数据
- **ISR配置**:
  - 重新验证时间: 60秒 (开发) / 300秒 (生产)
  - 缓存控制: `s-maxage=300, stale-while-revalidate=1800`
- **依赖组件**:
  - `src/components/layout/content-card.tsx`
  - `src/hooks/useContentCards.ts`
- **缓存键**: `content-cards-all`

### 3. 项目数据生成
- **函数**: `generateProjectCardData()`
- **位置**: `src/config/content-data.ts`
- **描述**: 生成精选项目卡片数据
- **ISR配置**: 页面级别配置
- **依赖页面**:
  - `src/app/(page)/me/page.tsx`
- **缓存键**: `project-cards`

### 4. 重新验证 API
- **路径**: `/api/revalidate`
- **方法**: POST
- **描述**: 按需重新验证指定路径的缓存
- **参数**: `path` (查询参数)
- **安全**: 需要 `CACHE_REFRESH_TOKEN` 验证

## 数据源配置

### 博客数据 API
- **开发环境**: `http://localhost:8000`
- **生产环境**: `https://your-api-domain.com`
- **配置文件**: 
  - `src/config/isr-config.ts`
  - `.env.local` / `.env.production`

### 内容分类器
- **位置**: `src/lib/content-classifier.ts`
- **功能**: 文章分类和数据提取
- **依赖**: `extractAllArticles()` 函数

## ISR 配置管理

### 配置文件
- **主配置**: `src/config/isr-config.ts`
- **环境变量**: `.env.local`, `.env.production`

### 环境变量
```bash
# ISR 基础配置
ISR_REVALIDATE_TIME=60|300
ISR_STALE_TIME=300|1800
ISR_ENABLE_ON_DEMAND=true
ISR_MAX_RETRIES=3
ISR_RETRY_DELAY=1000|2000

# 图片缓存配置
ISR_IMAGE_REVALIDATE_TIME=3600|7200
ISR_IMAGE_STALE_TIME=86400|172800
ISR_IMAGE_MAX_AGE=31536000
```

### 缓存管理函数
- `getCacheConfig()`: 获取缓存配置
- `isCacheStale()`: 检查缓存是否过期
- `createCacheStatus()`: 创建缓存状态对象
- `getRevalidatePath()`: 获取重新验证路径
- `getISRConfig()`: 获取完整ISR配置

## 组件依赖树

```
src/app/page.tsx
├── generateRecommendCardData()
└── generateNewsCardData()

src/app/(page)/me/page.tsx
├── generateProjectCardData()
└── ContentCard (with ISR)

src/components/layout/Home.tsx
├── useNavigationData()
└── ISR 缓存状态显示

src/components/layout/content-card.tsx
├── useContentCards()
├── ISR 缓存状态指示
└── 手动刷新功能

src/hooks/useNavigationData.ts
├── getCacheConfig()
├── createCacheStatus()
└── getRevalidatePath()

src/hooks/useContentCards.ts
├── getAllCardData()
└── 缓存管理逻辑
```

## 性能优化策略

### 1. 缓存层级
- **L1**: 浏览器缓存 (Cache-Control)
- **L2**: CDN缓存 (s-maxage)
- **L3**: ISR缓存 (Next.js)
- **L4**: 数据源缓存 (API)

### 2. 重新验证策略
- **时间触发**: 基于 `revalidate` 时间
- **按需触发**: 通过 `/api/revalidate` 端点
- **错误重试**: 最大3次，延迟递增

### 3. 缓存键管理
- **导航**: `navigation-data`
- **内容卡片**: `content-cards-{category}`
- **项目数据**: `project-cards`
- **图片**: `image-{source}-{params}`

## 监控和调试

### 缓存状态指示
- **绿色圆点**: 缓存新鲜
- **黄色圆点**: 缓存过期
- **刷新按钮**: 手动重新验证

### 开发工具
- **环境**: `NODE_ENV=development`
- **调试日志**: ISR 状态和错误
- **热重载**: 自动缓存刷新

## 环境配置管理

### 配置文件结构
- `.env.local`: 开发环境配置
- `.env.production`: 生产环境配置
- `ENV_CONFIG.md`: 配置说明文档

### 配置优化特性
- 统一的配置结构和命名
- 环境差异化配置
- 完整的配置说明文档
- 安全配置最佳实践

### 关键配置项
- ISR缓存策略配置
- 分类映射缓存配置
- API服务地址配置
- 安全令牌配置

## 部署注意事项

### 生产环境
1. 参考 `ENV_CONFIG.md` 进行配置
2. 生产环境必须替换所有占位符
3. 设置正确的 `BLOG_API_URL`
4. 配置 `CACHE_REFRESH_TOKEN`
5. 启用 CDN 缓存
6. 监控 ISR 性能指标

### 安全配置
- API 密钥管理
- 缓存刷新令牌
- CORS 配置
- 速率限制
- 定期更新安全配置

---

**最后更新**: $(date)
**维护者**: XRAK 开发团队