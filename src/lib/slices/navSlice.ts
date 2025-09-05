import { createSlice } from '@reduxjs/toolkit'

interface NavState {
  isNavVisible: boolean
  isMobileNavVisible: boolean
  isDesktopNavVisible: boolean
  isMobile: boolean
}

const initialState: NavState = {
  isNavVisible: true, // 保持向后兼容
  isMobileNavVisible: false, // 移动端默认隐藏
  isDesktopNavVisible: true, // 桌面端默认显示
  isMobile: false
}

const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    toggleNav: (state) => {
      if (state.isMobile) {
        state.isMobileNavVisible = !state.isMobileNavVisible
      } else {
        state.isDesktopNavVisible = !state.isDesktopNavVisible
      }
      // 更新通用状态以保持向后兼容
      state.isNavVisible = state.isMobile ? state.isMobileNavVisible : state.isDesktopNavVisible
    },
    toggleMobileNav: (state) => {
      state.isMobileNavVisible = !state.isMobileNavVisible
      if (state.isMobile) {
        state.isNavVisible = state.isMobileNavVisible
      }
    },
    toggleDesktopNav: (state) => {
      state.isDesktopNavVisible = !state.isDesktopNavVisible
      if (!state.isMobile) {
        state.isNavVisible = state.isDesktopNavVisible
      }
    },
    setMobileMode: (state, action) => {
      state.isMobile = action.payload
      // 切换屏幕模式时，更新通用状态
      state.isNavVisible = state.isMobile ? state.isMobileNavVisible : state.isDesktopNavVisible
    },
    showNav: (state) => {
      if (state.isMobile) {
        state.isMobileNavVisible = true
      } else {
        state.isDesktopNavVisible = true
      }
      state.isNavVisible = true
    },
    hideNav: (state) => {
      if (state.isMobile) {
        state.isMobileNavVisible = false
      } else {
        state.isDesktopNavVisible = false
      }
      state.isNavVisible = false
    }
  }
})

export const { 
  toggleNav, 
  toggleMobileNav, 
  toggleDesktopNav, 
  setMobileMode, 
  showNav, 
  hideNav 
} = navSlice.actions
export default navSlice.reducer