# 环境配置说明

## 配置文件结构

### `.env.local` (开发环境)
开发环境专用配置，包含本地开发所需的所有环境变量。

### `.env.production` (生产环境)
生产环境配置，优化了性能和安全性设置。

## 配置项说明

### 应用基础配置
- `NEXT_PUBLIC_APP_NAME`: 应用名称
- `NEXT_PUBLIC_APP_VERSION`: 应用版本
- `NEXT_PUBLIC_APP_URL`: 应用访问地址

### API配置
- `API_BASE_URL`: 内部API基础地址
- `BLOG_API_URL`: 博客数据API地址

### ISR缓存配置
- `ISR_REVALIDATE_TIME`: 页面重新验证时间(秒)
- `ISR_STALE_TIME`: 缓存过期时间(秒)
- `ISR_ENABLE_ON_DEMAND`: 是否启用按需重新验证
- `ISR_MAX_RETRIES`: 最大重试次数
- `ISR_RETRY_DELAY`: 重试延迟时间(毫秒)
- `ISR_IMAGE_*`: 图片缓存相关配置

### 分类映射配置
- `MAPPING_CACHE_TTL`: 映射缓存生存时间
- `MAPPING_ENABLE_*`: 各种缓存策略开关
- `MAPPING_PRIMARY_SOURCE`: 主要数据源
- `MAPPING_FALLBACK_SOURCE`: 备用数据源
- `MAPPING_REFRESH_INTERVAL`: 刷新间隔
- `MAPPING_DEBUG_LOGS`: 调试日志开关
- `MAPPING_AUTO_REFRESH`: 自动刷新开关
- `MAPPING_HOT_RELOAD`: 热重载开关

### 安全配置
- `CACHE_REFRESH_TOKEN`: 缓存刷新令牌
- `API_SECRET_KEY`: API密钥
- `DATABASE_URL`: 数据库连接地址(可选)

## 环境差异

| 配置项 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| ISR_REVALIDATE_TIME | 60s | 300s | 生产环境缓存时间更长 |
| ISR_STALE_TIME | 300s | 1800s | 生产环境允许更长的过期时间 |
| MAPPING_DEBUG_LOGS | true | false | 生产环境关闭调试日志 |
| MAPPING_AUTO_REFRESH | true | false | 生产环境关闭自动刷新 |
| MAPPING_HOT_RELOAD | true | false | 生产环境关闭热重载 |
| MAPPING_REFRESH_INTERVAL | 60s | 300s | 生产环境降低刷新频率 |

## 最佳实践

1. **安全性**: 生产环境必须设置真实的安全令牌
2. **性能**: 生产环境使用更长的缓存时间
3. **调试**: 开发环境启用调试功能，生产环境关闭
4. **监控**: 建议在生产环境添加监控相关配置

## 部署注意事项

1. 部署前检查所有 `your-*` 占位符是否已替换
2. 确保安全令牌的强度和唯一性
3. 根据实际服务器性能调整缓存配置
4. 定期更新安全配置