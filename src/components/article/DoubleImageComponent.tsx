import React from 'react'
import Image from 'next/image'
import { getImageCacheConfig } from '@/config/isr-config'

interface DoubleImageComponentProps {
  leftImage: {
    src: string
    alt: string
    caption?: string
    priority?: boolean
    quality?: number
  }
  rightImage: {
    src: string
    alt: string
    caption?: string
    priority?: boolean
    quality?: number
  }
  id?: string
}

export function DoubleImageComponent({ leftImage, rightImage, id }: DoubleImageComponentProps) {
  const imageConfig = getImageCacheConfig()
  const leftQuality = leftImage.quality || imageConfig.quality.default
  const rightQuality = rightImage.quality || imageConfig.quality.default

  return (
    <div className="w-full my-6 grid grid-cols-1 md:grid-cols-2 gap-4" id={id}>
      {/* 左侧图片 */}
      <figure className="w-full">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg dark:shadow-neutral-800/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-neutral-700/50">
          <Image
            src={leftImage.src}
            alt={leftImage.alt}
            fill
            className="object-cover"
            quality={leftQuality}
            priority={leftImage.priority || false}
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        {leftImage.caption && (
          <figcaption className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center italic">
            {leftImage.caption}
          </figcaption>
        )}
      </figure>

      {/* 右侧图片 */}
      <figure className="w-full">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg dark:shadow-neutral-800/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-neutral-700/50">
          <Image
            src={rightImage.src}
            alt={rightImage.alt}
            fill
            className="object-cover"
            quality={rightQuality}
            priority={rightImage.priority || false}
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        {rightImage.caption && (
          <figcaption className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center italic">
            {rightImage.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

export default DoubleImageComponent