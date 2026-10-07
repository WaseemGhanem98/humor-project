'use client'

import { useState } from 'react'
import { ImageIcon } from '@/components/icons'

type Props = {
  src: string | null
  alt: string | null
  caption: string
  priority?: boolean
}

// Fixed 4:3 frame so every meme lines up; object-cover crops instead of stretching.
export default function MemeImage({ src, alt, caption, priority = false }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/[0.04]">
      {src && status !== 'error' ? (
        // Plain <img> keeps things simple (no next/image remote config needed).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? `Meme image for: ${caption}`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          // Catches images that failed before hydration attached onError.
          ref={(img) => {
            if (img?.complete) setStatus(img.naturalWidth ? 'loaded' : 'error')
          }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 text-muted">
          <ImageIcon className="h-8 w-8 opacity-60" />
          <p className="text-sm font-medium">
            {src ? 'Image unavailable' : 'No image yet'}
          </p>
        </div>
      )}

      {src && status === 'loading' && <div aria-hidden className="skeleton absolute inset-0 rounded-none" />}
    </div>
  )
}
