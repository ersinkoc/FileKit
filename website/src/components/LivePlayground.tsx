import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2, Image, FileText, Film, Music } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import clsx from 'clsx'

interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  preview?: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Film
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function LivePlayground() {
  const { theme } = useTheme()
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const createFileItem = (file: File): FileItem => {
    const item: FileItem = {
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
    }

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, preview: e.target?.result as string } : f
        ))
      }
      reader.readAsDataURL(file)
    }

    return item
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const newItems = droppedFiles.map(createFileItem)
    setFiles(prev => [...prev, ...newItems])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const newItems = Array.from(selectedFiles).map(createFileItem)
      setFiles(prev => [...prev, ...newItems])
    }
    e.target.value = ''
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const simulateUpload = useCallback(async () => {
    setIsUploading(true)

    for (const file of files) {
      if (file.status !== 'pending') continue

      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ))

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, progress } : f
        ))
      }

      // Random success/failure
      const success = Math.random() > 0.1
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: success ? 'completed' : 'error', progress: 100 } : f
      ))
    }

    setIsUploading(false)
  }, [files])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  const pendingCount = files.filter(f => f.status === 'pending').length
  const completedCount = files.filter(f => f.status === 'completed').length

  return (
    <div className={clsx(
      'rounded-2xl border overflow-hidden',
      theme === 'dark'
        ? 'bg-zinc-900/50 border-zinc-800'
        : 'bg-white border-zinc-200'
    )}>
      {/* Header */}
      <div className={clsx(
        'flex items-center justify-between px-6 py-4 border-b',
        theme === 'dark'
          ? 'bg-zinc-900 border-zinc-800'
          : 'bg-zinc-50 border-zinc-200'
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Upload className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className={clsx(
              'font-semibold',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Live Playground
            </h3>
            <p className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            )}>
              Try FileKit right in your browser
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex items-center gap-3">
            <span className={clsx(
              'text-sm',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            )}>
              {completedCount}/{files.length} uploaded
            </span>
            <button
              onClick={clearAll}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              )}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={clsx(
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
            isDragActive
              ? 'border-violet-500 bg-violet-500/5'
              : theme === 'dark'
                ? 'border-zinc-700 hover:border-zinc-600'
                : 'border-zinc-300 hover:border-zinc-400'
          )}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <motion.div
            animate={{ scale: isDragActive ? 1.05 : 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={clsx(
              'p-4 rounded-full',
              isDragActive
                ? 'bg-violet-500/20'
                : theme === 'dark'
                  ? 'bg-zinc-800'
                  : 'bg-zinc-100'
            )}>
              <Upload className={clsx(
                'w-8 h-8',
                isDragActive
                  ? 'text-violet-500'
                  : theme === 'dark'
                    ? 'text-zinc-400'
                    : 'text-zinc-500'
              )} />
            </div>
            <div>
              <p className={clsx(
                'font-medium',
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className={clsx(
                'text-sm mt-1',
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              )}>
                or click to browse
              </p>
            </div>
          </motion.div>
        </div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3"
            >
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type)

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-xl border',
                      theme === 'dark'
                        ? 'bg-zinc-800/50 border-zinc-700/50'
                        : 'bg-zinc-50 border-zinc-200'
                    )}
                  >
                    {/* Preview/Icon */}
                    <div className={clsx(
                      'w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0',
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'
                    )}>
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className={clsx(
                          'w-6 h-6',
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        )} />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'font-medium truncate',
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      )}>
                        {file.name}
                      </p>
                      <p className={clsx(
                        'text-sm',
                        theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                      )}>
                        {formatFileSize(file.size)}
                      </p>

                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'completed') && (
                        <div className={clsx(
                          'mt-2 h-1.5 rounded-full overflow-hidden',
                          theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'
                        )}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className={clsx(
                              'h-full rounded-full',
                              file.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-violet-500'
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {file.status === 'pending' && (
                        <span className={clsx(
                          'text-sm',
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        )}>
                          Pending
                        </span>
                      )}
                      {file.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                      )}
                      {file.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-colors shrink-0',
                        theme === 'dark'
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                          : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200'
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )
              })}

              {/* Upload Button */}
              {pendingCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={simulateUpload}
                  disabled={isUploading}
                  className={clsx(
                    'w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                    isUploading
                      ? 'bg-violet-500/50 cursor-not-allowed'
                      : 'bg-violet-500 hover:bg-violet-600',
                    'text-white'
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
