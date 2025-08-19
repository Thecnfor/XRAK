'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ContentCardData } from '@/components/layout/content-card';
import { getAllCardData } from '@/config/content-data';

interface UseContentCardsState {
  recommendCardData: ContentCardData[];
  newsCardData: ContentCardData[];
  projectCardData: ContentCardData[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

interface UseContentCardsReturn extends UseContentCardsState {
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * 用于管理内容卡片数据的自定义Hook
 * 支持加载状态、错误处理和手动刷新
 */
export function useContentCards(): UseContentCardsReturn {
  const [state, setState] = useState<UseContentCardsState>({
    recommendCardData: [],
    newsCardData: [],
    projectCardData: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const fetchCardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const cardData = await getAllCardData();
      
      setState({
        recommendCardData: cardData.recommendCardData,
        newsCardData: cardData.newsCardData,
        projectCardData: cardData.projectCardData,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch card data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchCardData();
  }, [fetchCardData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 初始化数据获取
  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  return {
    ...state,
    refresh,
    clearError
  };
}

/**
 * 用于获取特定类型卡片数据的Hook
 */
export function useSpecificCardData(type: 'recommend' | 'news' | 'project') {
  const { recommendCardData, newsCardData, projectCardData, isLoading, error, refresh, clearError } = useContentCards();
  
  const getCardData = () => {
    switch (type) {
      case 'recommend':
        return recommendCardData;
      case 'news':
        return newsCardData;
      case 'project':
        return projectCardData;
      default:
        return [];
    }
  };
  
  return {
    cardData: getCardData(),
    isLoading,
    error,
    refresh,
    clearError
  };
}

/**
 * 用于单个卡片数据的Hook（带索引）
 */
export function useCardData(type: 'recommend' | 'news' | 'project', index: number) {
  const { cardData, isLoading, error, refresh, clearError } = useSpecificCardData(type);
  
  return {
    data: cardData[index] || null,
    isLoading,
    error,
    refresh,
    clearError,
    hasData: index < cardData.length
  };
}