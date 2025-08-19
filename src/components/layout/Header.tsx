'use client'

import Link from "next/link";
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleNav } from '@/lib/slices/navSlice';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <header className="relative z-[var(--zHeader)]">
        <div className="
        absolute
        left-0
        top-0
        text-[var(--color-text)]
        h-[var(--header-height)]
        z-[1]
        flex
        items-center
        justify-between
        ml-6
        text-2xl
        ">
          <div className="
          flex
          items-center
          justify-between
          w-full
          gap-10
          ">
            <Link href="/">
            <span className="
            font-bold
            text-2xl
            ">
              XRAK.<span className="text-sm text-thin"></span>
            </span>
            </Link>
            <NavShow position="left" />
          </div>
        </div>
        <div className="
        absolute
        top-0
        right-0
        w-full
        h-[var(--header-height)]
        px-6
        text-[var(--color-text)]
        flex
        items-center
        justify-end
        gap-3
        backdrop-filter
        backdrop-blur-md
        bg-[rgba(255,255,255,0.01)]
        ">
          <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
          <SearchContent isSearchOpen={isSearchOpen} />
          <div className="
          flex
          items-center
          justify-center
          ">
            <Login />
            <NavShow position="right" />
          </div>
        </div>
    </header>
  );
};

const NavShow = (props: {position?: 'left' | 'right'}) => {
  const dispatch = useAppDispatch();
  const { isMobileNavVisible, isDesktopNavVisible, isMobile } = useAppSelector((state) => state.nav);
  
  const handleToggleNav = () => {
    dispatch(toggleNav());
  };
  
  // 根据当前屏幕模式选择对应的导航状态
  const currentNavVisible = isMobile ? isMobileNavVisible : isDesktopNavVisible;
  
  return (
    <button 
      className={`
        text-[var(--color-btn)]
        hover:text-[var(--color-text)]
        cursor-pointer
        ${props.position === 'right' ? 'md:hidden' : 'hidden md:block'}
        transition-colors
        duration-200
      `}
      id="showNav-btn"
      onClick={handleToggleNav}
      aria-label={currentNavVisible ? '隐藏导航栏' : '显示导航栏'}
    >
      {currentNavVisible ? (
        <svg width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z" fill="currentColor"></path>
        </svg>
      ) : (
        <svg width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.47108 18.9992 8.26339 19 9.4 19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H9.4C8.26339 5 7.47108 5.00078 6.85424 5.05118ZM7 7C7.55229 7 8 7.44772 8 8V16C8 16.5523 7.55229 17 7 17C6.44772 17 6 16.5523 6 16V8C6 7.44772 6.44772 7 7 7Z" fill="currentColor"></path>
        </svg>
      )}
    </button>
  )
}

const Search = ({ isSearchOpen, setIsSearchOpen }: { isSearchOpen: boolean; setIsSearchOpen: (value: boolean) => void }) => {
  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  return(
    <button 
      className="
        text-[var(--color-btn)]
        hover:text-[var(--color-text)]
        cursor-pointer
        transition-all
        duration-200
        hover:scale-105
        active:scale-95
        p-1
      "
      onClick={handleToggleSearch}
      aria-label={isSearchOpen ? '关闭搜索' : '打开搜索'}
    >
      <div className={`
        transition-all 
        duration-300 
        ease-out
        transform-gpu
        ${
          isSearchOpen 
            ? 'scale-125 rotate-90' 
            : 'scale-100 rotate-0'
        }
      `}>
        {isSearchOpen ? (
          <svg 
            width="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-opacity duration-200"
          >
            <path d="M4.23431 4.23431C4.54673 3.9219 5.05327 3.9219 5.36569 4.23431L8 6.86863L10.6343 4.23431C10.9467 3.9219 11.4533 3.9219 11.7657 4.23431C12.0781 4.54673 12.0781 5.05327 11.7657 5.36569L9.13137 8L11.7657 10.6343C12.0781 10.9467 12.0781 11.4533 11.7657 11.7657C11.4533 12.0781 10.9467 12.0781 10.6343 11.7657L8 9.13137L5.36569 11.7657C5.05327 12.0781 4.54673 12.0781 4.23431 11.7657C3.9219 11.4533 3.9219 10.9467 4.23431 10.6343L6.86863 8L4.23431 5.36569C3.9219 5.05327 3.9219 4.54673 4.23431 4.23431Z" fill="currentColor"></path>
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            viewBox="0 0 16 16" 
            fill="none"
            className="transition-opacity duration-200"
          >
            <path d="M13.8333 13.8333L10.7022 10.7022M10.7022 10.7022C11.607 9.79738 12.1667 8.54738 12.1667 7.16667C12.1667 4.40525 9.9281 2.16667 7.16667 2.16667C4.40525 2.16667 2.16667 4.40525 2.16667 7.16667C2.16667 9.9281 4.40525 12.1667 7.16667 12.1667C8.54738 12.1667 9.79738 11.607 10.7022 10.7022Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
          </svg>
        )}
      </div>
    </button>
  )
}

export const Login = ({ isMd = true }: { isMd?: boolean }) => {
  
  return(
    <button className={`
      hover:color-blue-400
      cursor-pointer
      ml-2
      px-5
      py-2
      bg-[var(--color-primary)]
      rounded-full
      hover:bg-[var(--color-primary-hover)]
      duration-300
      flex
      items-center
      justify-center
      text-sm
      ${isMd ? 'hidden md:block' : 'block md:hidden'}
    `}>
      <Link href="/login">
      登录
      </Link>
    </button>
  )
}

const SearchContent = ({ isSearchOpen }: { isSearchOpen: boolean }) => {
  if (!isSearchOpen){return null}

  return (
    <div className={`    
    w-screen md:h-[calc(var(--document-height)-4rem)] h-[calc(var(--document-height)-3.5rem)]
    fixed top-[-0.2rem] left-0
    bg-[var(--color-bg)]
    z-[1] border-t-1 border-solid
    border-[var(--color-primary-hover)]
    opacity-0
    flex flex-col items-center justify-between
    ${isSearchOpen ? 'animate-[fadeIn_0.24s_ease-out_forwards]' : 'animate-[fadeOut_0.2s_ease-out_forwards]'}
    mt-[3.5rem] md:mt-[4rem]
    `}>
      <div>123</div>
      <div>123</div>
    </div>
  )
}
