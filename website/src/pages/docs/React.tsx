import CodeBlock from '../../components/CodeBlock'

export default function ReactGuide() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">React Integration</h1>
      <p className="text-zinc-400 text-lg mb-8">
        First-class React support with hooks and components for file uploads.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Installation</h2>
        <p className="text-zinc-400 mb-4">
          The React adapter is included with the main package:
        </p>
        <CodeBlock
          code={`npm install @oxog/filekit`}
          language="bash"
          filename="terminal"
        />
        <CodeBlock
          code={`// Import from the /react subpath
import { useUploader, useDropZone, DropZone, FileList } from '@oxog/filekit/react'`}
          language="typescript"
          filename="imports.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">useUploader Hook</h2>
        <p className="text-zinc-400 mb-4">
          The main hook for managing file uploads:
        </p>
        <CodeBlock
          code={`import { useUploader } from '@oxog/filekit/react'

function FileUpload() {
  const {
    files,           // Array of file items
    addFile,         // Add a single file
    addFiles,        // Add multiple files
    removeFile,      // Remove a file by ID
    removeAll,       // Remove all files
    upload,          // Upload a single file
    uploadAll,       // Upload all files
    cancel,          // Cancel a single upload
    cancelAll,       // Cancel all uploads
    retry,           // Retry a failed upload
    retryAll,        // Retry all failed uploads
    progress,        // Overall progress object
    isUploading,     // Is any upload in progress
    getFile,         // Get a file by ID
    getFilesByStatus, // Get files by status
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*'],
    maxFiles: 10,
  })

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => addFiles(Array.from(e.target.files || []))}
      />

      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.name} - {file.status} ({file.progress}%)
            <button onClick={() => removeFile(file.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <p>Progress: {progress.percentage}%</p>

      <button onClick={uploadAll} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload All'}
      </button>
    </div>
  )
}`}
          language="tsx"
          filename="useUploader.tsx"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">useUploader Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Option</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">endpoint</code></td>
                <td className="py-3 px-4">string | function</td>
                <td className="py-3 px-4">Upload endpoint URL</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFileSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Maximum file size in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">allowedTypes</code></td>
                <td className="py-3 px-4">string[]</td>
                <td className="py-3 px-4">Allowed MIME types</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFiles</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Maximum number of files</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">autoUpload</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">Auto upload when files are added</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">onAdd</code></td>
                <td className="py-3 px-4">function</td>
                <td className="py-3 px-4">Callback when file is added</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">onProgress</code></td>
                <td className="py-3 px-4">function</td>
                <td className="py-3 px-4">Callback on progress update</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">onComplete</code></td>
                <td className="py-3 px-4">function</td>
                <td className="py-3 px-4">Callback when upload completes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">onError</code></td>
                <td className="py-3 px-4">function</td>
                <td className="py-3 px-4">Callback when upload fails</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">useDropZone Hook</h2>
        <p className="text-zinc-400 mb-4">
          Create drag and drop zones with full control:
        </p>
        <CodeBlock
          code={`import { useDropZone } from '@oxog/filekit/react'

function MyDropZone() {
  const {
    getRootProps,    // Props for the drop zone container
    getInputProps,   // Props for the hidden input element
    isDragActive,    // Is something being dragged over
    isDragAccept,    // Is the dragged item acceptable
    isDragReject,    // Is the dragged item rejected
    open,            // Open file dialog programmatically
  } = useDropZone({
    accept: ['image/*', 'application/pdf'],
    multiple: true,
    maxFiles: 5,
    onDrop: (files) => {
      console.log('Dropped files:', files)
    },
    onDropRejected: (rejections) => {
      console.log('Rejected:', rejections)
    },
  })

  return (
    <div
      {...getRootProps()}
      className={\`drop-zone \${isDragActive ? 'active' : ''}\`}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        isDragAccept ? (
          <p>Drop files here!</p>
        ) : (
          <p>Some files will be rejected</p>
        )
      ) : (
        <p>Drag files here or click to browse</p>
      )}

      <button type="button" onClick={open}>
        Browse Files
      </button>
    </div>
  )
}`}
          language="tsx"
          filename="useDropZone.tsx"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">DropZone Component</h2>
        <p className="text-zinc-400 mb-4">
          Pre-built drop zone component with render props:
        </p>
        <CodeBlock
          code={`import { DropZone } from '@oxog/filekit/react'

function Upload() {
  const handleDrop = (files: File[]) => {
    console.log('Files:', files)
  }

  return (
    <DropZone
      onDrop={handleDrop}
      accept={['image/*']}
      multiple
      maxFiles={10}
      className="border-2 border-dashed rounded-lg p-8"
      activeClassName="border-violet-500 bg-violet-500/10"
    >
      {({ isDragActive, open }) => (
        <div className="text-center">
          {isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <>
              <p>Drag files here</p>
              <button onClick={open}>Or browse</button>
            </>
          )}
        </div>
      )}
    </DropZone>
  )
}`}
          language="tsx"
          filename="DropZone.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">FileInput Component</h2>
        <p className="text-zinc-400 mb-4">
          Styled file input component:
        </p>
        <CodeBlock
          code={`import { FileInput } from '@oxog/filekit/react'

function Upload() {
  return (
    <FileInput
      onChange={(files) => console.log('Selected:', files)}
      accept={['image/*', 'application/pdf']}
      multiple
      className="file-input"
    >
      <span>Choose Files</span>
    </FileInput>
  )
}`}
          language="tsx"
          filename="FileInput.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">FileList Component</h2>
        <p className="text-zinc-400 mb-4">
          Display files with progress and actions:
        </p>
        <CodeBlock
          code={`import { useUploader, FileList } from '@oxog/filekit/react'

function Upload() {
  const { files, removeFile, retry } = useUploader({
    endpoint: '/api/upload',
  })

  return (
    <FileList
      files={files}
      onRemove={removeFile}
      onRetry={retry}
      showPreview       // Show image previews
      showProgress      // Show upload progress
      showSize          // Show file size
      showStatus        // Show status badge
      previewMaxWidth={80}
      previewMaxHeight={80}
    />
  )
}

// Or use a custom render
function CustomFileList() {
  const { files, removeFile } = useUploader({ endpoint: '/api/upload' })

  return (
    <FileList
      files={files}
      renderItem={(file, { preview, remove }) => (
        <div key={file.id} className="file-item">
          {preview && <img src={preview} alt={file.name} />}
          <span>{file.name}</span>
          <span>{file.progress}%</span>
          <button onClick={remove}>Remove</button>
        </div>
      )}
    />
  )
}`}
          language="tsx"
          filename="FileList.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">UploadProgress Component</h2>
        <p className="text-zinc-400 mb-4">
          Display overall upload progress:
        </p>
        <CodeBlock
          code={`import { useUploader, UploadProgress } from '@oxog/filekit/react'

function Upload() {
  const uploader = useUploader({ endpoint: '/api/upload' })

  return (
    <div>
      {/* Default progress bar */}
      <UploadProgress progress={uploader.progress} />

      {/* Detailed progress */}
      <UploadProgress
        progress={uploader.progress}
        showPercentage
        showFileCount
        showBytes
      />

      {/* Custom render */}
      <UploadProgress
        progress={uploader.progress}
        render={(progress) => (
          <div>
            <div
              className="progress-bar"
              style={{ width: \`\${progress.percentage}%\` }}
            />
            <span>
              {progress.completedFiles}/{progress.totalFiles} files
              ({progress.percentage}%)
            </span>
          </div>
        )}
      />
    </div>
  )
}`}
          language="tsx"
          filename="UploadProgress.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">useImagePreview Hook</h2>
        <p className="text-zinc-400 mb-4">
          Generate image previews with automatic cleanup:
        </p>
        <CodeBlock
          code={`import { useImagePreview } from '@oxog/filekit/react'

function ImagePreview({ file }: { file: File }) {
  const { previewUrl, isLoading, error } = useImagePreview(file, {
    maxWidth: 300,
    maxHeight: 300,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!previewUrl) return null

  return <img src={previewUrl} alt={file.name} />
}

// With multiple files
function ImageGallery({ files }: { files: File[] }) {
  return (
    <div className="gallery">
      {files.map((file, i) => (
        <ImagePreview key={i} file={file} />
      ))}
    </div>
  )
}`}
          language="tsx"
          filename="useImagePreview.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">ImagePreview Component</h2>
        <p className="text-zinc-400 mb-4">
          Pre-built image preview component:
        </p>
        <CodeBlock
          code={`import { ImagePreview } from '@oxog/filekit/react'

function Preview({ file }: { file: File }) {
  return (
    <ImagePreview
      file={file}
      maxWidth={200}
      maxHeight={200}
      className="rounded-lg"
      fallback={<div>No preview</div>}
      loading={<div>Loading...</div>}
    />
  )
}`}
          language="tsx"
          filename="ImagePreview.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">useFileSelect Hook</h2>
        <p className="text-zinc-400 mb-4">
          Programmatic file selection:
        </p>
        <CodeBlock
          code={`import { useFileSelect } from '@oxog/filekit/react'

function SelectButton() {
  const { open, files } = useFileSelect({
    accept: ['image/*'],
    multiple: true,
    onSelect: (files) => {
      console.log('Selected:', files)
    },
  })

  return (
    <button onClick={open}>
      Select Images ({files.length} selected)
    </button>
  )
}`}
          language="tsx"
          filename="useFileSelect.tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Complete Example</h2>
        <CodeBlock
          code={`import {
  useUploader,
  DropZone,
  FileList,
  UploadProgress,
} from '@oxog/filekit/react'

export default function FileUpload() {
  const {
    files,
    addFiles,
    removeFile,
    uploadAll,
    cancelAll,
    retryAll,
    progress,
    isUploading,
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*', 'application/pdf'],
    maxFiles: 10,
    onComplete: (file) => {
      console.log('Uploaded:', file.name)
    },
    onError: (file, error) => {
      console.error('Failed:', file.name, error)
    },
  })

  const hasFiles = files.length > 0
  const hasPending = files.some(f => f.status === 'pending')
  const hasFailed = files.some(f => f.status === 'error')

  return (
    <div className="space-y-6">
      <DropZone
        onDrop={addFiles}
        accept={['image/*', 'application/pdf']}
        multiple
        disabled={isUploading}
        className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center"
        activeClassName="border-violet-500 bg-violet-500/10"
      >
        {({ isDragActive }) => (
          <div>
            {isDragActive ? (
              <p>Drop files here...</p>
            ) : (
              <p>Drag files here or click to browse</p>
            )}
            <p className="text-sm text-zinc-500 mt-2">
              Max 10MB per file. Images and PDFs only.
            </p>
          </div>
        )}
      </DropZone>

      {hasFiles && (
        <>
          <FileList
            files={files}
            onRemove={removeFile}
            showPreview
            showProgress
            showSize
          />

          <UploadProgress
            progress={progress}
            showPercentage
            showFileCount
          />

          <div className="flex gap-4">
            {hasPending && !isUploading && (
              <button
                onClick={uploadAll}
                className="px-4 py-2 bg-violet-500 text-white rounded"
              >
                Upload All
              </button>
            )}

            {isUploading && (
              <button
                onClick={cancelAll}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Cancel All
              </button>
            )}

            {hasFailed && !isUploading && (
              <button
                onClick={retryAll}
                className="px-4 py-2 bg-zinc-700 text-white rounded"
              >
                Retry Failed
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}`}
          language="tsx"
          filename="CompleteExample.tsx"
          showLineNumbers
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">TypeScript Support</h2>
        <p className="text-zinc-400 mb-4">
          All hooks and components are fully typed:
        </p>
        <CodeBlock
          code={`import type {
  FileItem,
  FileStatus,
  UploadProgress,
  UploaderConfig,
  DropZoneConfig,
} from '@oxog/filekit'

// Type your callbacks
const onComplete = (file: FileItem) => {
  console.log(file.response)
}

// Type your components
interface UploadFormProps {
  onUploadComplete?: (file: FileItem) => void
  maxFiles?: number
}`}
          language="typescript"
          filename="types.ts"
        />
      </section>
    </div>
  )
}
