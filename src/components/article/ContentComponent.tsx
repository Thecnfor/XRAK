import React from 'react'

interface ContentComponentProps {
  text: string
  id: string
}

export const ContentComponent: React.FC<ContentComponentProps> = ({ text, id }) => {
  // 处理代码块的渲染
  const renderContent = (content: string) => {
    // 检查是否包含代码块
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        const beforeText = content.slice(lastIndex, match.index)
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {beforeText}
          </span>
        )
      }

      // 添加代码块
      const language = match[1] || 'text'
      const code = match[2]
      parts.push(
        <div key={`code-${match.index}`} className="my-4">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{language}</div>
            <pre className="text-sm text-neutral-800 dark:text-neutral-200">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )

      lastIndex = match.index + match[0].length
    }

    // 添加剩余的文本
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex)
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {remainingText}
        </span>
      )
    }

    return parts.length > 0 ? parts : (
      <span className="whitespace-pre-wrap">{content}</span>
    )
  }

  return (
    <div 
      id={id}
      className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 mb-6"
    >
      {renderContent(text)}
    </div>
  )
}

export default ContentComponent