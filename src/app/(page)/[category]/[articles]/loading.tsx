export default function Loading() {
  return (
    <div className="max-h-screen h-full bg-white text-neutral-900 dark:bg-black dark:text-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-8 px-4 max-w-md">
        {/* 加载动画 */}
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-400 rounded-full animate-spin"></div>
          </div>
          <div className="w-24 h-px bg-neutral-200 dark:bg-neutral-700 mx-auto"></div>
        </div>
        
        {/* 加载信息 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-medium text-neutral-800 dark:text-neutral-200">
            正在加载
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            正在获取文章内容，请稍候...
          </p>
        </div>
        
        {/* 加载进度指示 */}
        <div className="w-32 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-neutral-600 dark:bg-neutral-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '加载中... - XRAK',
  description: '正在加载文章内容',
}