import React from 'react'
import { TitleComponent } from './TitleComponent'
import { ContentComponent } from './ContentComponent'
import { CodeComponent } from './CodeComponent'
import { ImageComponent } from './ImageComponent'
import { DoubleImageComponent } from './DoubleImageComponent'
import { ImageTextComponent } from './ImageTextComponent'

interface BlockData {
  id: string
  type: 'title' | 'content' | 'section' | 'code' | 'image' | 'double-image' | 'image-text'
  data: {
    title?: string
    text?: string
    level?: number
    content?: string
    code?: string
    language?: string
    src?: string
    alt?: string
    caption?: string
    leftImage?: {
      src: string
      alt: string
      caption?: string
    }
    rightImage?: {
      src: string
      alt: string
      caption?: string
    }
    image?: {
      src: string
      alt: string
      caption?: string
    }
  }
}

interface ArticleContent {
  blocks: BlockData[]
}

// API返回的结构化内容格式
interface StructuredContent {
  title: string
  sections: Array<{
    title: string
    content: string
    subsections?: Array<{
      title: string
      content: string
    }>
  }>
  conclusion: string
}

interface ArticleRendererProps {
  content: ArticleContent | StructuredContent
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content }) => {
  // 检查是否为结构化内容格式
  const isStructuredContent = (content: ArticleContent | StructuredContent): content is StructuredContent => {
    return content && typeof content === 'object' && 'title' in content && 'sections' in content
  }

  // 渲染结构化内容
  const renderStructuredContent = (structuredContent: StructuredContent) => {
    return (
      <div className="prose-content">
        {/* 主标题 */}
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {structuredContent.title}
        </h1>
        
        {/* 章节内容 */}
        {structuredContent.sections.map((section, index) => (
          <div key={`section-${index}`} className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 mt-8">
              {section.title}
            </h2>
            <div className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 mb-6 whitespace-pre-wrap">
              {section.content}
            </div>
            
            {/* 子章节 */}
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <div key={`subsection-${index}-${subIndex}`} className="ml-4 mb-6">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  {subsection.title}
                </h3>
                <div className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {subsection.content}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* 结论 */}
        {structuredContent.conclusion && (
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              结论
            </h2>
            <div className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
              {structuredContent.conclusion}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBlock = (block: BlockData) => {
    switch (block.type) {
      case 'title':
        return (
          <TitleComponent
            key={block.id}
            text={block.data.text!}
            level={block.data.level || 2}
            id={block.id}
          />
        )
      case 'content':
        return (
          <ContentComponent
            key={block.id}
            text={block.data.text!}
            id={block.id}
          />
        )
      case 'section':
        return (
          <div key={block.id} className="mb-8">
            {block.data.title && (
              <TitleComponent
                text={block.data.title.toString()}
                level={2}
                id={`${block.id}-title`}
              />
            )}
            {block.data.content && (
              <ContentComponent
                text={block.data.content}
                id={`${block.id}-content`}
              />
            )}
          </div>
        )
      case 'code':
          return (
            <CodeComponent
              key={block.id}
              code={block.data.code || ''}
              language={block.data.language}
              id={block.id}
            />
          )
        case 'image':
          return (
            <ImageComponent
              key={block.id}
              src={block.data.src || ''}
              alt={block.data.alt || ''}
              caption={block.data.caption}
              id={block.id}
            />
          )
        case 'double-image':
          return (
            <DoubleImageComponent
              key={block.id}
              leftImage={block.data.leftImage || { src: '', alt: '' }}
              rightImage={block.data.rightImage || { src: '', alt: '' }}
              id={block.id}
            />
          )
        case 'image-text':
          return (
            <ImageTextComponent
              key={block.id}
              image={block.data.image || { src: '', alt: '' }}
              content={block.data.content || ''}
              id={block.id}
            />
          )
        default:
          return null
    }
  }

  // 根据内容类型选择渲染方式
  if (isStructuredContent(content)) {
    return renderStructuredContent(content)
  }

  // 原有的blocks格式
  const articleContent = content as ArticleContent
  if (!articleContent.blocks) {
    return (
      <div className="prose-content">
        <p className="text-neutral-500 dark:text-neutral-400">内容格式错误</p>
      </div>
    )
  }

  return (
    <div className="prose-content">
      {articleContent.blocks.map(renderBlock)}
    </div>
  )
}

export default ArticleRenderer