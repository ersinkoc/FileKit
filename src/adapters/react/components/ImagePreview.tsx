import type { ReactNode } from 'react'
import type { PreviewOptions, ImageDimensions } from '../../../types'
import { useImagePreview } from '../hooks/useImagePreview'

export interface ImagePreviewProps extends PreviewOptions {
  file: File | null

  // Fallback
  fallback?: ReactNode

  // Loading
  loading?: ReactNode

  // Callbacks
  onLoad?: (dimensions: ImageDimensions) => void
  onError?: (error: Error) => void

  // Customization
  className?: string
  alt?: string
}

export function ImagePreview({
  file,
  maxWidth,
  maxHeight,
  quality,
  type,
  fallback,
  loading,
  onLoad,
  onError,
  className,
  alt = 'Preview',
}: ImagePreviewProps) {
  const { preview, isLoading, error, dimensions } = useImagePreview(file, {
    maxWidth,
    maxHeight,
    quality,
    type,
  })

  // Handle callbacks
  if (dimensions && onLoad) {
    onLoad(dimensions)
  }

  if (error && onError) {
    onError(error)
  }

  // Loading state
  if (isLoading) {
    return <>{loading ?? <div className={className}>Loading...</div>}</>
  }

  // Error state
  if (error || !preview) {
    return <>{fallback ?? null}</>
  }

  // Render preview
  return (
    <img
      src={preview}
      alt={alt}
      className={className}
      style={{
        maxWidth: maxWidth ?? 'auto',
        maxHeight: maxHeight ?? 'auto',
        objectFit: 'contain',
      }}
    />
  )
}
