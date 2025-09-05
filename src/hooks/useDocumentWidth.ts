"use client";

import { useState, useEffect } from 'react';

/**
 * 文档尺寸接口
 */
interface DocumentDimensions {
  width: number;
  height: number;
}

/**
 * 实时获取当前文档宽度的hook
 * 解决100svw在文档超过100svh时的滚动条bug问题
 * @returns {number} 当前文档的实际宽度（像素值）
 */
export function useDocumentWidth(): number {
  const [documentWidth, setDocumentWidth] = useState<number>(0);

  useEffect(() => {
    // 获取准确的文档宽度，排除滚动条影响
    const getDocumentWidth = (): number => {
      // 使用 document.documentElement.clientWidth 获取不包含滚动条的宽度
      return document.documentElement.clientWidth || window.innerWidth;
    };

    // 初始化设置宽度
    setDocumentWidth(getDocumentWidth());

    // 监听窗口大小变化
    const handleResize = () => {
      setDocumentWidth(getDocumentWidth());
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 监听方向变化（移动设备）
    window.addEventListener('orientationchange', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return documentWidth;
}

/**
 * 实时获取当前文档高度的hook
 * 解决100svh在文档超过100svw时的滚动条bug问题
 * @returns {number} 当前文档的实际高度（像素值）
 */
export function useDocumentHeight(): number {
  const [documentHeight, setDocumentHeight] = useState<number>(0);

  useEffect(() => {
    // 获取准确的文档高度，排除滚动条影响
    const getDocumentHeight = (): number => {
      // 使用 document.documentElement.clientHeight 获取不包含滚动条的高度
      return document.documentElement.clientHeight || window.innerHeight;
    };

    // 初始化设置高度
    setDocumentHeight(getDocumentHeight());

    // 监听窗口大小变化
    const handleResize = () => {
      setDocumentHeight(getDocumentHeight());
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 监听方向变化（移动设备）
    window.addEventListener('orientationchange', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return documentHeight;
}

/**
 * 实时获取当前文档宽度和高度的hook
 * @returns {DocumentDimensions} 包含宽度和高度的对象
 */
export function useDocumentDimensions(): DocumentDimensions {
  const [dimensions, setDimensions] = useState<DocumentDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    // 获取准确的文档尺寸，排除滚动条影响
    const getDocumentDimensions = (): DocumentDimensions => {
      return {
        width: document.documentElement.clientWidth || window.innerWidth,
        height: document.documentElement.clientHeight || window.innerHeight
      };
    };

    // 初始化设置尺寸
    setDimensions(getDocumentDimensions());

    // 监听窗口大小变化
    const handleResize = () => {
      setDimensions(getDocumentDimensions());
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 监听方向变化（移动设备）
    window.addEventListener('orientationchange', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return dimensions;
}

/**
 * 获取文档宽度的CSS变量值
 * @returns {string} CSS变量格式的宽度值
 */
export function useDocumentWidthCSS(): string {
  const width = useDocumentWidth();
  return `${width}px`;
}

/**
 * 获取文档高度的CSS变量值
 * @returns {string} CSS变量格式的高度值
 */
export function useDocumentHeightCSS(): string {
  const height = useDocumentHeight();
  return `${height}px`;
}

/**
 * 获取文档尺寸的CSS变量值
 * @returns {object} 包含宽度和高度CSS变量的对象
 */
export function useDocumentDimensionsCSS(): { width: string; height: string } {
  const { width, height } = useDocumentDimensions();
  return {
    width: `${width}px`,
    height: `${height}px`
  };
}

export default useDocumentWidth;