import React from 'react'
import Image from 'next/image'
import { getImageCacheConfig } from '@/config/isr-config'

interface ImageComponentProps {
  src: string
  alt: string
  caption?: string
  id?: string
  priority?: boolean
  quality?: number
  width?: number
  height?: number
}

export function ImageComponent({ 
  src, 
  alt, 
  caption, 
  id, 
  priority = false,
  quality
}: ImageComponentProps) {
  const imageConfig = getImageCacheConfig()
  const imageQuality = quality || imageConfig.quality.default

  return (
    <figure className="w-full my-6" id={id}>
      <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-lg dark:shadow-neutral-800/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-neutral-700/50">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          quality={imageQuality}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export default ImageComponent