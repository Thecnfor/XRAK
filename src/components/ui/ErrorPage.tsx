'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ErrorPageProps {
  title?: string
  message?: string
  showReload?: boolean
  autoRetry?: boolean
  retryInterval?: number
}

export default function ErrorPage({ 
  title = "服务暂时不可用", 
  message = "抱歉，页面加载时遇到了问题。这可能是由于服务器连接问题导致的。",
  showReload = true,
  autoRetry = true,
  retryInterval = 10000 // 10秒
}: ErrorPageProps) {
  const [retryCount, setRetryCount] = useState(() => {
    // 从localStorage读取重试次数，如果不存在则返回0
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('errorPageRetryCount')
        if (stored) {
          const count = parseInt(stored, 10)
          return isNaN(count) ? 0 : count
        }
      } catch (error) {
        console.warn('读取重试次数失败:', error)
      }
    }
    return 0
  })
  const [isRetrying, setIsRetrying] = useState(false)
  
  const handleReload = () => {
    // 手动重新加载时清除重试计数
    try {
      localStorage.removeItem('errorPageRetryCount')
    } catch (error) {
      console.warn('清除重试次数失败:', error)
    }
    window.location.reload()
  }
  
  // 自动重试机制
  useEffect(() => {
    if (!autoRetry) return
    
    const checkServerStatus = async () => {
      try {
        setIsRetrying(true)
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-store'
        })
        
        if (response.ok) {
          // 服务器恢复，清除重试计数并重新加载页面
          try {
            localStorage.removeItem('errorPageRetryCount')
          } catch (error) {
            console.warn('清除重试次数失败:', error)
          }
          window.location.reload()
        }
      } catch {
        // 服务器仍然不可用，继续等待
        console.log('服务器仍不可用，将在', retryInterval / 1000, '秒后重试')
      } finally {
        setIsRetrying(false)
        setRetryCount(prev => {
          const newCount = prev + 1
          // 将新的重试次数保存到localStorage
          try {
            localStorage.setItem('errorPageRetryCount', newCount.toString())
          } catch (error) {
            console.warn('保存重试次数失败:', error)
          }
          return newCount
        })
      }
    }
    
    const timer = setInterval(checkServerStatus, retryInterval)
    
    return () => clearInterval(timer)
  }, [autoRetry, retryInterval])

  return (
    <div className="max-h-screen h-full bg-white text-neutral-900 dark:bg-black dark:text-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-8 px-4 max-w-md">
        {/* 错误图标 */}
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="w-24 h-px bg-neutral-200 dark:bg-neutral-700 mx-auto"></div>
        </div>
        
        {/* 错误信息 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-medium text-neutral-800 dark:text-neutral-200">
            {title}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* 重试状态显示 */}
        {autoRetry && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isRetrying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-600 dark:border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  正在检测服务器状态...
                </span>
              ) : (
                `自动重试中 (${retryCount} 次尝试)`
              )}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              每 {retryInterval / 1000} 秒自动检测一次服务器状态
            </p>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showReload && (
            <button 
              onClick={handleReload}
              disabled={isRetrying}
              className="inline-flex cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 disabled:bg-neutral-400 disabled:dark:bg-neutral-600 disabled:cursor-not-allowed disabled:hover:text-white dark:disabled:hover:text-black transition-colors duration-500  rounded-lg"
            >
              {isRetrying ? '检测中...' : '重新加载'}
            </button>
          )}
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-transparent border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all rounded-lg"
          >
            返回首页
          </Link>
        </div>
        
        {/* 提示信息 */}
        <div className="text-xs text-neutral-500 dark:text-neutral-500">
          如果问题持续存在，请稍后再试
        </div>
      </div>
    </div>
  )
}