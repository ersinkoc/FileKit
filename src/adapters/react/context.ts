import { createContext, useContext } from 'react'
import type { Uploader, UploaderConfig } from '../../types'

export interface FileKitContextValue {
  uploader: Uploader
  config: UploaderConfig
}

export const FileKitContext = createContext<FileKitContextValue | null>(null)

export function useFileKitContext(): FileKitContextValue {
  const context = useContext(FileKitContext)
  if (!context) {
    throw new Error('useFileKitContext must be used within a FileKitProvider')
  }
  return context
}
