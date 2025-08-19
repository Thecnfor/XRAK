"use client";

import { useEffect } from 'react';
import { useDocumentWidth } from '@/hooks/useDocumentWidth';

/**
 * 文档宽度提供者组件
 * 自动将实时文档宽度同步到CSS变量 --document-width
 */
export function DocumentWidthProvider({ children }: { children: React.ReactNode }) {
  const documentWidth = useDocumentWidth();

  useEffect(() => {
    // 动态更新CSS变量
    if (documentWidth > 0) {
      document.documentElement.style.setProperty('--document-width', `${documentWidth}px`);
    }
  }, [documentWidth]);

  return <>{children}</>;
}

export default DocumentWidthProvider;