import { useEffect, useState } from 'react'
import type { ImageDimensions, PreviewOptions } from '../../../types'
import { createImagePreview } from '../../../preview/image-preview'
import { isImage } from '../../../utils/file'

export interface UseImagePreviewResult {
  preview: string | null
  isLoading: boolean
  error: Error | null
  dimensions: ImageDimensions | null
}

export function useImagePreview(
  file: File | null,
  options: PreviewOptions = {}
): UseImagePreviewResult {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      setDimensions(null)
      setError(null)
      return
    }

    if (!isImage(file)) {
      setError(new Error('File is not an image'))
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    createImagePreview(file, options)
      .then((result) => {
        if (!cancelled) {
          setPreview(result.url)
          setDimensions({
            width: result.width,
            height: result.height,
          })
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [file, options.maxWidth, options.maxHeight, options.quality, options.type])

  return {
    preview,
    isLoading,
    error,
    dimensions,
  }
}
