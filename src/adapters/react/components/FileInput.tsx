import { useCallback, useRef, type ReactNode, type ChangeEvent } from 'react'
import type { ValidationError } from '../../../types'
import { validateFileSize } from '../../../validation/size'
import { validateFileType } from '../../../validation/type'

export interface FileInputProps {
  children?: ReactNode
  multiple?: boolean
  accept?: string
  maxFiles?: number
  maxFileSize?: number
  onChange?: (files: File[]) => void
  onError?: (errors: ValidationError[]) => void
  className?: string
  placeholder?: string
}

export function FileInput({
  children,
  multiple = false,
  accept,
  maxFiles,
  maxFileSize,
  onChange,
  onError,
  className,
  placeholder,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files
      if (!fileList || fileList.length === 0) return

      const files = Array.from(fileList)
      const validFiles: File[] = []
      const errors: ValidationError[] = []

      // Validate files
      for (const file of files) {
        let valid = true

        // Check max files
        if (maxFiles && validFiles.length >= maxFiles) {
          errors.push({
            code: 'MAX_FILES_EXCEEDED',
            message: `Maximum ${maxFiles} files allowed`,
            file,
          })
          continue
        }

        // Check file size
        if (maxFileSize) {
          const sizeResult = validateFileSize(file, { max: maxFileSize })
          if (!sizeResult.valid) {
            errors.push(...sizeResult.errors)
            valid = false
          }
        }

        // Check file type
        if (accept) {
          const types = accept.split(',').map((t) => t.trim())
          const typeResult = validateFileType(file, { allowed: types })
          if (!typeResult.valid) {
            errors.push(...typeResult.errors)
            valid = false
          }
        }

        if (valid) {
          validFiles.push(file)
        }
      }

      if (errors.length > 0) {
        onError?.(errors)
      }

      if (validFiles.length > 0) {
        onChange?.(validFiles)
      }

      // Reset input
      event.target.value = ''
    },
    [maxFiles, maxFileSize, accept, onChange, onError]
  )

  // Render as styled button with children
  if (children) {
    return (
      <div onClick={handleClick} className={className} style={{ cursor: 'pointer' }}>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {children}
      </div>
    )
  }

  // Render as styled input
  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}
