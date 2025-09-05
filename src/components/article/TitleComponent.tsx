import React, { JSX } from 'react'

interface TitleComponentProps {
  text: string
  level: number
  id: string
}

export const TitleComponent: React.FC<TitleComponentProps> = ({ text, level, id }) => {
  const getHeadingClass = (level: number): string => {
    const baseClasses = 'font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight'
    
    switch (level) {
      case 1:
        return `${baseClasses} text-4xl`
      case 2:
        return `${baseClasses} text-3xl mt-8`
      case 3:
        return `${baseClasses} text-2xl mt-6`
      case 4:
        return `${baseClasses} text-xl mt-4`
      case 5:
        return `${baseClasses} text-lg mt-3`
      case 6:
        return `${baseClasses} text-base mt-2`
      default:
        return `${baseClasses} text-2xl mt-6`
    }
  }

  const headingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements

  return React.createElement(
    headingTag,
    {
      id,
      className: getHeadingClass(level)
    },
    text
  )
}

export default TitleComponent