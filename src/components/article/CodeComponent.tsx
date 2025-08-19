import React from 'react'

interface CodeComponentProps {
  code: string
  language?: string
  id?: string
}

export const CodeComponent: React.FC<CodeComponentProps> = ({ 
  code, 
  language = 'text', 
  id 
}) => {
  return (
    <div className="mb-6" id={id}>
      <pre className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto">
        <code className={`language-${language} text-neutral-800 dark:text-neutral-200 text-sm`}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export default CodeComponent