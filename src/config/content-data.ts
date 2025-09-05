import type { ContentCardData } from '@/components/layout/content-card';
import { generateRecommendCardData, generateNewsCardData, generateProjectCardData, getAllClassifiedCardData } from '@/lib/content-classifier';
import { ISR_CONFIG } from './isr-config';

// 联系方式链接数据类型
export interface ContactLinkData {
  name: string;
  href: string;
  icon?: string;
  external?: boolean;
}

// 导航链接数据类型
export interface NavigationLinkData {
  name: string;
  href: string;
  category: string;
  description?: string;
}

// 卡片数据配置常量
export const CARD_CONFIG = {
  RECOMMEND_COUNT: 3,
  NEWS_COUNT: 6,
  PROJECT_COUNT: 6,
  CACHE_KEY: ISR_CONFIG.CACHE_KEYS.CONTENT_CARDS
} as const;

/**
 * 获取推荐卡片数据（3条随机内容）
 * @returns Promise<ContentCardData[]>
 */
export async function getRecommendCardData(): Promise<ContentCardData[]> {
  return await generateRecommendCardData();
}

/**
 * 获取最新卡片数据（6条内容，按时间倒序排列）
 * @returns Promise<ContentCardData[]>
 */
export async function getNewsCardData(): Promise<ContentCardData[]> {
  return await generateNewsCardData();
}

/**
 * 获取精选项目卡片数据（6条随机显示）
 * @returns Promise<ContentCardData[]>
 */
export async function getProjectCardData(): Promise<ContentCardData[]> {
  return await generateProjectCardData();
}

/**
 * 获取所有分类的卡片数据
 * @returns Promise<{recommendCardData: ContentCardData[], newsCardData: ContentCardData[], projectCardData: ContentCardData[]}>
 */
export async function getAllCardData() {
  return await getAllClassifiedCardData();
}

// 联系方式链接数据配置
export const contactLinksData: ContactLinkData[] = [
  {
    name: "w5555wdnmd@gmail.com",
    href: "mailto:w5555wdnmd@gmail.com",
    icon: "",
    external: false
  },
  {
    name: "GitHub",
    href: "https://github.com/Thecnfor",
    external: true
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    external: true
  },
  {
    name: "X",
    href: "https://x.com",
    external: true
  },
  {
    name: "Discord",
    href: "https://discord.gg/example",
    external: true
  },
  {
    name: "Bilibili",
    href: "https://space.bilibili.com/531615073?spm_id_from=333.1007.0.0",
    external: true
  }
];
// 导航链接数据配置
export const navigationLinksData: NavigationLinkData[] = [
  {
    name: "技术博客",
    href: "/tech",
    category: "技术", 
    description: "技术相关的文章和教程"
  },
  {
    name: "架构设计",
    href: "/architecture",
    category: "架构",
    description: "系统架构和设计模式"
  },
  {
    name: "前端开发",
    href: "/frontend",
    category: "前端",
    description: "前端技术和框架"
  },
  {
    name: "AI 人工智能",
    href: "/ai",
    category: "AI",
    description: "人工智能和机器学习"
  },
  {
    name: "区块链",
    href: "/blockchain",
    category: "区块链",
    description: "区块链技术和Web3"
  },
  {
    name: "研究笔记",
    href: "/research",
    category: "研究",
    description: "技术研究和实验"
  }
];
// 默认卡片数据
export const defaultCardData: ContentCardData = {
  title: "默认标题",
  category: "默认分类",
  publishDate: "发布日期",
  content: "默认"
};