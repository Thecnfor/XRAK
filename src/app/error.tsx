'use client'

import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台或错误监控服务
    console.error('应用错误:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-8 px-4 max-w-md">
        {/* 错误图标 */}
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
              />
            </svg>
          </div>
          <div className="w-24 h-px bg-neutral-200 dark:bg-neutral-700 mx-auto"></div>
        </div>
        
        {/* 错误信息 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-medium text-neutral-800 dark:text-neutral-200">
            出现了一些问题
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            抱歉，应用遇到了意外错误。我们已经记录了这个问题，请稍后再试。
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left text-xs text-neutral-500 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 p-3 rounded border">
              <summary className="cursor-pointer mb-2 font-medium">错误详情 (开发模式)</summary>
              <pre className="whitespace-pre-wrap break-words">
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors rounded-lg"
          >
            重试
          </button>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-transparent border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all rounded-lg"
          >
            返回首页
          </Link>
        </div>
        
        {/* 提示信息 */}
        <div className="text-xs text-neutral-500 dark:text-neutral-500">
          如果问题持续存在，请联系技术支持
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '应用错误 - XRAK',
  description: '应用遇到了意外错误，请稍后再试。',
}