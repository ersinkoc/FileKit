import { useCallback, useRef, useState } from 'react'

export interface FileSelectOptions {
  multiple?: boolean
  accept?: string
  onSelect?: (files: File[]) => void
}

export interface UseFileSelectResult {
  open: () => void
  files: File[]
  clear: () => void
}

export function useFileSelect(options: FileSelectOptions = {}): UseFileSelectResult {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Create hidden input on demand
  const getInput = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      document.body.appendChild(input)
      inputRef.current = input
    }

    const input = inputRef.current
    input.multiple = options.multiple ?? false
    if (options.accept) {
      input.accept = options.accept
    }

    return input
  }, [options.multiple, options.accept])

  // Open file dialog
  const open = useCallback(() => {
    const input = getInput()

    input.onchange = () => {
      const selectedFiles = input.files
      if (selectedFiles && selectedFiles.length > 0) {
        const filesArray = Array.from(selectedFiles)
        setFiles(filesArray)
        options.onSelect?.(filesArray)
      }
      input.value = ''
    }

    input.click()
  }, [getInput, options])

  // Clear selected files
  const clear = useCallback(() => {
    setFiles([])
  }, [])

  return {
    open,
    files,
    clear,
  }
}
