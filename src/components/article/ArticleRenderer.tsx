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

interface ArticleRendererProps {
  content: ArticleContent
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content }) => {
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

  return (
    <div className="prose-content">
      {content.blocks.map(renderBlock)}
    </div>
  )
}

export default ArticleRenderer