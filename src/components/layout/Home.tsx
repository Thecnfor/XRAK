'use client'

import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setMobileMode, toggleMobileNav } from '@/lib/slices/navSlice'
import { Login } from './Header'
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler"
import { type NavigationItem } from '@/lib/navigation'
import { useNavigationData, useNavigationItems } from '@/hooks/useNavigationData'
import { NavigationSkeleton, NavigationError, CacheStatusIndicator } from '@/components/providers/NavigationSkeleton'

export default function Home({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isMobileNavVisible, isDesktopNavVisible, isMobile } = useAppSelector((state) => state.nav)
  
  // 监听屏幕尺寸变化
  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth < 768 // md breakpoint
      dispatch(setMobileMode(isMobileScreen))
    }
    
    // 初始检查
    checkMobile()
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [dispatch])
  
  // 根据当前屏幕模式选择对应的导航状态
  
  // 移动端类名
  const mobileClasses = isMobileNavVisible 
    ? 'grid-cols-[calc(var(--document-width)-4rem)_1fr]' 
    : 'grid-cols-[0_1fr]'
  
  // 桌面端类名
  const desktopClasses = isDesktopNavVisible 
    ? 'md:grid-cols-[var(--nav-width)_1fr]' 
    : 'md:grid-cols-[0_1fr]'
  
  // 使用key强制重新渲染，避免跨设备模式的过渡动画
  const layoutKey = isMobile ? 'mobile' : 'desktop'
  
  // 只在同一设备模式下启用过渡动画
  const shouldTransition = isMobile 
    ? 'transition-[grid-template-columns] duration-800 ease-curve-sidebar' 
    : 'md:transition-[grid-template-columns] md:duration-500 md:ease-curve-sidebar'
  
  return (
    <div key={layoutKey} className={`
        grid
        ${shouldTransition}
        ${mobileClasses}
        ${desktopClasses}
    `}>
        <Nav />
        <Content>
            {children}
        </Content>
    </div>
  )
}

// 返回按钮组件
const BackButton = ({ onClick, title }: { onClick?: () => void, title: string }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMdScreen, setIsMdScreen] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMdScreen(window.innerWidth >= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  const handleMouseEnter = () => {
    if (isMdScreen) {
      setIsHovered(true)
    }
  }
  
  const handleMouseLeave = () => {
    if (isMdScreen) {
      setIsHovered(false)
    }
  }
  
  return (
    <button 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="
        md:px-3 md:py-2 text-nav inline-block w-full mb-[0.375rem] cursor-pointer
      "
    >
      <div className="md:gap-2 text-primary-44 flex items-center gap-[0.625rem]">
        <span className="transform duration-300 ease-curve-sidebar"
          style={{
            transform: isHovered && isMdScreen ? 'translateX(-2px)' : 'translateX(0px)',
          }}
        >
          <svg className="w-[16px] md:w-[11px] text-[var(--color-btn)] " width="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: 'rotate(0deg)'}}>
            <path d="M0.245636 8.59302C-0.0818787 8.2655 -0.0818787 7.7345 0.245636 7.40698L4.43892 3.2137C4.76643 2.88619 5.29744 2.88619 5.62495 3.2137C5.95247 3.54122 5.95247 4.07223 5.62495 4.39974L2.86335 7.16134H10.9025C11.3657 7.16134 11.7412 7.53682 11.7412 8C11.7412 8.46318 11.3657 8.83866 10.9025 8.83866H2.86335L5.62495 11.6003C5.95247 11.9278 5.95247 12.4588 5.62495 12.7863C5.29744 13.1138 4.76643 13.1138 4.43892 12.7863L0.245636 8.59302Z" fill="currentColor"/>
          </svg>
        </span>
        <span className="text-[18px] font-bold text-[var(--color-btn)] md:text-[16px]">{title}</span>
      </div>
    </button>
  )
}

// 二级菜单内容组件
const SecondaryMenuContent = ({ navigationItem, onMobileNavClose }: { navigationItem?: NavigationItem; onMobileNavClose?: () => void }) => {
  if (!navigationItem?.articles) {
    return null
  }
  
  return (
    <>
      <ul>
        {navigationItem.articles.map((article, index) => {
          // 构建文章链接，使用分类href + 文章索引
          const articleHref = `${navigationItem.href}/${index + 1}`
          return (
            <NavItemSimple 
              key={`${article.title}-${index}`}
              title={article.title} 
              href={articleHref}
              onMobileNavClose={onMobileNavClose}
            />
          )
        })}
      </ul>
    </>
  )
}

// 有二级菜单的导航项组件
const NavItemWithSubmenu = ({ 
  navigationItem, 
  isSecondaryVisible, 
  onToggle, 
  showArrow = true,
  onMobileNavClose
}: {
  navigationItem: NavigationItem
  isSecondaryVisible: boolean
  onToggle: () => void
  showArrow?: boolean
  onMobileNavClose?: () => void
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [dispatch])
  
  const handleClick = () => {
    if (isMobile) {
      // 移动端：只展开菜单，不跳转
      onToggle()
    } else {
      // 桌面端：先跳转再展开菜单
      if (navigationItem.defaultArticle) {
        router.push(navigationItem.defaultArticle)
      } else {
        router.push(navigationItem.href)
      }
      onToggle()
    }
  }
  
  return (
    <div className="group relative my-3">
      <div className="
        hover:bg-[var(--color-nav)]
        rounded-lg
        transition ease-curve-a duration-250
      ">
        <button
          onClick={handleClick}
          className="
          px-3 py-3 md:py-2 h-full w-full
          font-bold dark:font-medium
          leading-[1.375rem] md:cursor-pointer
          focus-visible:rounded-sm
          text-[var(--color-text)]
          flex items-center justify-start
          ">
          {navigationItem.title}
        </button>
        {showArrow && (
          <span className="
            absolute
            top-3/10
            -translate-y-1/2
            right-0
            duration-fast pointer-events-none 
            transition-opacity group-hover:opacity-100 
            md:translate-x-[0.125rem] md:opacity-0
            items-center
            pr-3
            hidden md:flex
            ">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-primary-44" width="10" viewBox="0 0 10 16" fill="none" style={{transform: 'rotate(270deg)'}}><path d="M0.209209 5.35206C0.488154 5.07312 0.940415 5.07312 1.21936 5.35206L5.00001 9.1327L8.78064 5.35206C9.05958 5.07312 9.51184 5.07312 9.79079 5.35206C10.0697 5.63101 10.0697 6.08327 9.79079 6.36221L5.50509 10.6479C5.37114 10.7819 5.18945 10.8571 5.00001 10.8571C4.81057 10.8571 4.62889 10.7819 4.49494 10.6479L0.20921 6.36222C-0.0697361 6.08327 -0.0697368 5.63101 0.209209 5.35206Z" fill="currentColor"></path></svg>
          </span>
        )}
      </div>
      <div className={`
        fixed z-[1] h-screen w-[calc(var(--document-width)-4rem)] top-0 left-0
        mt-[4rem] transition-opacity duration-300 ease-in-out
        bg-[var(--color-bg)]
        ${isSecondaryVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="px-[1.5rem] pt-[1rem] mb-4 md:hidden">
          <BackButton title="返回主菜单" onClick={() => {
            onToggle()
          }} />
        </div>
        <div className={`
          px-3 md:px-4 h-full md:pt-[16.5rem]
          transition-all duration-300 ease-in-out
          ${isSecondaryVisible ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-4'}
        `}>
          <SecondaryMenuContent navigationItem={navigationItem} onMobileNavClose={onMobileNavClose} />
        </div>
      </div>
    </div>
  )
}

// 无二级菜单的导航项组件
const NavItemSimple = ({ title, href, onMobileNavClose }: { title: string; href: string; showArrow?: boolean; onMobileNavClose?: () => void }) => {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = pathname === href
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 移动端点击导航项时自动收起导航菜单
    if (isMobile && onMobileNavClose) {
      onMobileNavClose()
    }
    
    // 使用程序化导航，确保平滑跳转
    router.push(href)
  }
  
  return (
    <div className={`
      group relative my-1
      hover:bg-[var(--color-nav)]
      rounded-lg
      transition ease-curve-a duration-250
      ${isActive ? 'bg-[var(--color-nav)]' : ''}
    `}>
      <Link
        className="
        transition ease-curve-a duration-250
        px-3 py-4 md:py-2 h-full w-full
        font-bold dark:font-medium
        leading-[1.375rem] 
        focus-visible:rounded-sm
        text-[var(--color-text)]
        flex items-center justify-start md:justify-normal
        "
        href={href}
        onClick={handleClick}>
        {title}
      </Link>
    </div>
  )
}

const Nav = () => {
  const { isDesktopNavVisible } = useAppSelector((state) => state.nav)
  const dispatch = useAppDispatch()
  const [isSecondaryVisible, setIsSecondaryVisible] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<'left' | 'right'>('left')
  const [currentSubmenuItem, setCurrentSubmenuItem] = useState<NavigationItem | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 使用自定义Hook管理导航数据
  const {
    navigationData,
    isLoading,
    hasError,
    refetch,
    cacheStatus
  } = useNavigationData()
  const { simpleItems, submenuItems } = useNavigationItems(navigationData)
  
  const handleSubmenuToggle = (item: NavigationItem, panelType: 'mobile' | 'desktop') => {
    if (panelType === 'mobile') {
      // 移动端逻辑：如果点击的是当前已展开的项目，则关闭；否则切换到新项目
      if (currentSubmenuItem?.href === item.href && isSecondaryVisible) {
        setIsSecondaryVisible(false)
        setCurrentSubmenuItem(null)
      } else {
        setCurrentSubmenuItem(item)
        setIsSecondaryVisible(true)
      }
    } else {
      // 桌面端逻辑
      setCurrentSubmenuItem(item)
      setCurrentPanel('right')
    }
  }
  
  return (
    <>
    <div className="relative overflow-hidden">
        {/* 桌面端导航 */}
        <nav className={`
          px-5 w-[var(--nav-width)] absolute right-0 top-0 mt-[187px] hidden md:block
          ${isDesktopNavVisible ? 'translate-x-0' : 'translate-x-full'}
        `}>
            <div className="fixed max-h-[calc(100svh-192px)] overflow-hidden pb-[46px] pr-6
            flex gap-[20px] transition-transform duration-sidebar ease-curve-sidebar" 
            style={{ transform: `translateX(${currentPanel === 'left' ? '0' : '-50%'})` }}>
                <div className={`w-[calc(var(--spacing-nav-width)-2*var(--spacing-xs))] flex-shrink-0 transition-all duration-sidebar ease-curve-sidebar ${
                  currentPanel === 'right' ? 'opacity-0 blur-[1px]' : 'opacity-100 blur-0'
                }`}>
                    {isLoading ? (
                      <div className="text-nav-mobile space-y-4 font-medium md:text-nav-desktop">
                        <NavigationSkeleton itemCount={5} isMobile={false} />
                        <CacheStatusIndicator cacheStatus={cacheStatus} showDetails={process.env.NODE_ENV === 'development'} />
                      </div>
                    ) : hasError ? (
                      <div className="text-nav-mobile space-y-4 font-medium md:text-nav-desktop">
                        <NavigationError 
                          onRetry={refetch} 
                          showRefresh={false} 
                          isMobile={false}
                        />
                      </div>
                    ) : (
                        <ul className="text-nav-mobile space-y-2 font-medium md:text-nav-desktop">
                          {/* 渲染单级导航项 */}
                          {simpleItems.map((item, index) => (
                            <li 
                              key={item.href}
                              className="animate-fade-in-up"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animationFillMode: 'both'
                              }}
                            >
                              <NavItemSimple 
                                title={item.title} 
                                href={item.href} 
                              />
                            </li>
                          ))}
                          {/* 渲染二级导航项 */}
                          {submenuItems.map((item, index) => (
                            <li 
                              key={item.href}
                              className="animate-fade-in-up"
                              style={{
                                animationDelay: `${(simpleItems.length + index) * 100}ms`,
                                animationFillMode: 'both'
                              }}
                            >
                              <NavItemWithSubmenu 
                                navigationItem={item}
                                isSecondaryVisible={false} // 桌面端不使用这个状态
                                onToggle={() => handleSubmenuToggle(item, 'desktop')}
                              />
                            </li>
                          ))}
                        </ul>
                    )}
                </div>
                <div className={`w-[calc(var(--spacing-nav-width)-2*var(--spacing-xs))] flex-shrink-0 transition-all duration-sidebar ease-curve-sidebar ${
                  currentPanel === 'left' ? 'opacity-0 blur-[1px]' : 'opacity-100 blur-0'
                }`}>
                  <BackButton title={currentSubmenuItem?.title || "返回"} onClick={() => setCurrentPanel('left')} />
                  <ul className="text-nav-mobile space-y-2 font-medium md:text-nav-desktop">
                    {currentSubmenuItem?.articles?.map((article, index) => {
                      const articleHref = `${currentSubmenuItem.href}/${index + 1}`
                      return (
                        <NavItemSimple 
                          key={`${article.title}-${index}`}
                          title={article.title} 
                          href={articleHref} 
                        />
                      )
                    })}
                  </ul>
                </div>
            </div>
            <div className="bottom-[calc(-0.94*(var(--document-height)-187px))] fixed z-[50]">
              <AnimatedThemeToggler className="hidden md:block fixed left-[1.5rem]" />
            </div>
        </nav>
        {/* 移动端导航 */}
        <nav className={`
          md:hidden z-[3] absolute top-0 right-0 h-screen pl-5 transition-transform-width duration-sidebar ease-curve-sidebar
          w-[calc(var(--document-width)-4rem)] translate-x-0
        `}>
            <div className="fixed text-nav-mobile mt-[4rem] w-[calc(var(--document-width)-4rem-40px)]">
                {isLoading ? (
                  <>
                    <NavigationSkeleton itemCount={6} isMobile={true} />
                    <CacheStatusIndicator cacheStatus={cacheStatus} showDetails={process.env.NODE_ENV === 'development'} />
                  </>
                ) : hasError ? (
                  <NavigationError 
                    onRetry={refetch} 
                    showRefresh={true} 
                    isMobile={true}
                  />
                ) : (
                  <ul>
                      {/* 渲染单级导航项 */}
                      {simpleItems.map((item) => (
                        <NavItemSimple 
                          key={item.href}
                          title={item.title} 
                          href={item.href} 
                          showArrow={false}
                          onMobileNavClose={() => {
                            if (isMobile) {
                              dispatch(toggleMobileNav())
                            }
                          }}
                        />
                      ))}
                      {/* 渲染二级导航项 */}
                      {submenuItems.map((item) => (
                        <NavItemWithSubmenu 
                          key={item.href}
                          navigationItem={item}
                          isSecondaryVisible={isSecondaryVisible && currentSubmenuItem?.href === item.href} 
                          onToggle={() => handleSubmenuToggle(item, 'mobile')}
                          onMobileNavClose={() => {
                            if (isMobile) {
                              dispatch(toggleMobileNav())
                            }
                          }}
                        />
                      ))}
                  </ul>
                )}
            </div>
            <div className="
              fixed
              top-[90dvh]
              pl-5
              flex
              items-center
              justify-between
              text-[var(--color-text)]
              w-[calc(var(--document-width)-4rem-40px)]
            "
            >
              <AnimatedThemeToggler />
              <Login isMd={false} />
            </div>
        </nav>
    </div>
    </>
  )
}

const Content = ({ children }: { children: React.ReactNode }) => {
  const { isMobileNavVisible } = useAppSelector((state) => state.nav)
  
  return (
    <div className="relative h-screen overflow-x-hidden">
      <div className="w-full transition-transform duration-800 ease-curve-sidebar md:transition-none md:transform-none"
           style={{
             transform: isMobileNavVisible ? 'translateX(calc(var(--document-width) + 1rem - 100dvw))' : 'translateX(0)'
           }}>
        <main className="w-[100dvw] md:w-full h-[calc(var(--document-height)-var(--header-height))] mt-[var(--header-height)] overflow-y-auto relative @container outline-none overflow-hidden">
          <span className="sr-only" aria-live="polite" aria-atomic="true">XRAK</span>
          {children}
        </main>
      </div>
      
      {/* 移动端导航遮罩 */}
      <div className={`
        duration-sidebar ease-curve-sidebar 
        absolute left-0 top-0 h-full w-full 
        transition-[background-color,backdrop-filter,left]
        ${isMobileNavVisible ? 'bg-secondary-44 cursor-pointer backdrop-blur-[8px]' : 'pointer-events-none'}
        z-[2] md:hidden`}></div>
    </div>
  )
}
