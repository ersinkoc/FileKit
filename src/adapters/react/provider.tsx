import { useEffect, useMemo, type ReactNode } from 'react'
import type { UploaderConfig } from '../../types'
import { createUploader } from '../../core/uploader'
import { FileKitContext } from './context'

export interface FileKitProviderProps extends UploaderConfig {
  children: ReactNode
}

export function FileKitProvider({ children, ...config }: FileKitProviderProps) {
  const uploader = useMemo(() => createUploader(config), [])

  // Update config when props change
  useEffect(() => {
    uploader.setConfig(config)
  }, [config, uploader])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uploader.destroy()
    }
  }, [uploader])

  const value = useMemo(
    () => ({
      uploader,
      config,
    }),
    [uploader, config]
  )

  return <FileKitContext.Provider value={value}>{children}</FileKitContext.Provider>
}
