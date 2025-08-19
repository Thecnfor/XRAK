# XRAK 项目部署指南

## 环境变量配置

### 1. 环境变量文件说明

- `.env.example` - 环境变量模板文件，包含所有可配置项
- `.env.local` - 本地开发环境配置
- `.env.production` - 生产环境配置模板

### 2. 生产环境配置步骤

#### 必须配置的环境变量：

```bash
# 应用基础配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api
BLOG_API_URL=https://your-api-domain.com

# 安全配置（必须设置强密码）
CACHE_REFRESH_TOKEN=your-strong-secret-token
API_SECRET_KEY=your-strong-secret-key

# SEO配置（可选）
GOOGLE_SITE_VERIFICATION=your-google-verification-code
```

#### 性能优化配置：

```bash
# ISR缓存配置
ISR_REVALIDATE_TIME=60
ISR_STALE_TIME=300
ISR_ENABLE_ON_DEMAND=true

# 分类映射缓存
MAPPING_CACHE_TTL=3600
MAPPING_ENABLE_CACHING=true
MAPPING_ENABLE_COMPRESSION=true
MAPPING_ENABLE_CDN=true
```

## 构建和部署流程

### 1. 依赖安装

```bash
# 安装项目依赖
npm install

# 或使用 yarn
yarn install
```

### 2. 安全检查

```bash
# 检查依赖漏洞
npm audit

# 自动修复可修复的漏洞
npm audit fix

# 代码质量检查
npm run lint
```

### 3. 生产构建

```bash
# 构建生产版本
npm run build

# 验证构建结果
npm run start
```

### 4. 部署前检查清单

- [ ] 环境变量已正确配置
- [ ] 所有敏感信息已设置为生产环境值
- [ ] 依赖漏洞已修复
- [ ] 构建成功无错误
- [ ] Lighthouse 性能评分 ≥ 90
- [ ] SEO 配置已完成

### 5. 部署命令

#### Vercel 部署：
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel --prod
```

#### Docker 部署：
```bash
# 构建 Docker 镜像
docker build -t xrak .

# 运行容器
docker run -p 3000:3000 --env-file .env.production xrak
```

#### 传统服务器部署：
```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

## 性能优化建议

### 1. ISR (Incremental Static Regeneration)
- 已配置 60 秒重新验证时间
- 启用按需重新生成
- 配置了 300 秒的过期时间

### 2. 缓存策略
- 分类映射缓存 TTL: 1 小时
- 启用内存缓存和 API 缓存
- 生产环境启用压缩和 CDN

### 3. 安全配置
- 所有敏感信息通过环境变量管理
- 生产环境关闭调试日志
- 配置了缓存刷新令牌

## 监控和维护

### 1. 性能监控
- 定期检查 Lighthouse 评分
- 监控 Core Web Vitals
- 检查 ISR 缓存命中率

### 2. 安全维护
- 定期运行 `npm audit`
- 更新依赖包版本
- 轮换安全令牌

### 3. 内容更新
- 使用缓存刷新 API 更新内容
- 监控 API 响应时间
- 检查内容分类映射准确性