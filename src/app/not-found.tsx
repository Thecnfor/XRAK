import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-full bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* 404 数字 */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-foreground/20 dark:text-foreground/10 select-none">
            404
          </h1>
          <div className="w-24 h-px bg-foreground/20 dark:bg-foreground/10 mx-auto"></div>
        </div>
        
        {/* 错误信息 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-medium text-foreground/80">
            页面未找到
          </h2>
          <p className="text-foreground/60 max-w-md mx-auto leading-relaxed">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        {/* 返回按钮 */}
        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-foreground bg-transparent border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 dark:hover:bg-foreground/10 transition-all duration-200 rounded-lg"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: '页面未找到 - 404',
  description: '抱歉，您访问的页面不存在。',
};