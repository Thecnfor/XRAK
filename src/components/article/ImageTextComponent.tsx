import React from 'react'
import Image from 'next/image'
import { getImageCacheConfig } from '@/config/isr-config'

interface ImageTextComponentProps {
  image: {
    src: string
    alt: string
    caption?: string
    priority?: boolean
    quality?: number
  }
  content: string
  id?: string
}

export function ImageTextComponent({ image, content, id }: ImageTextComponentProps) {
  const imageConfig = getImageCacheConfig()
  const imageQuality = image.quality || imageConfig.quality.default

  return (
    <div className="w-full my-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" id={id}>
      {/* 左侧图片 */}
      <figure className="w-full">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg dark:shadow-neutral-800/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-neutral-700/50">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            quality={imageQuality}
            priority={image.priority || false}
            sizes="(max-width: 1024px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        {image.caption && (
          <figcaption className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center italic">
            {image.caption}
          </figcaption>
        )}
      </figure>

      {/* 右侧文字内容 */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageTextComponent