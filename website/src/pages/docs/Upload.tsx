import CodeBlock from '../../components/CodeBlock'

export default function Upload() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Upload</h1>
      <p className="text-zinc-400 text-lg mb-8">
        The core upload functionality with progress tracking, retries, and more.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Creating an Uploader</h2>
        <p className="text-zinc-400 mb-4">
          Use <code className="text-violet-400">createUploader</code> to create an uploader instance:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  maxFiles: 10,
})`}
          language="typescript"
          filename="uploader.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Adding Files</h2>
        <p className="text-zinc-400 mb-4">
          Add files to the uploader using <code className="text-violet-400">addFile</code> or{' '}
          <code className="text-violet-400">addFiles</code>:
        </p>
        <CodeBlock
          code={`// Add a single file
const fileItem = uploader.addFile(file)
console.log(fileItem.id, fileItem.name, fileItem.status)

// Add multiple files
const fileItems = uploader.addFiles(files)

// Get all files
const allFiles = uploader.getFiles()

// Get a specific file by ID
const file = uploader.getFile(fileItem.id)

// Get files by status
const pendingFiles = uploader.getFilesByStatus('pending')
const completedFiles = uploader.getFilesByStatus('completed')`}
          language="typescript"
          filename="adding-files.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Uploading Files</h2>
        <p className="text-zinc-400 mb-4">
          Upload files individually or all at once:
        </p>
        <CodeBlock
          code={`// Upload a single file
await uploader.upload(fileItem.id)

// Upload all pending files
await uploader.uploadAll()

// Auto-upload when files are added
const autoUploader = createUploader({
  endpoint: '/api/upload',
  autoUpload: true,
})

// Sequential upload (one at a time)
const sequentialUploader = createUploader({
  endpoint: '/api/upload',
  sequential: true,
})`}
          language="typescript"
          filename="uploading.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Events</h2>
        <p className="text-zinc-400 mb-4">
          Listen to upload events to update your UI:
        </p>
        <CodeBlock
          code={`// File added to queue
uploader.on('add', (file) => {
  console.log('Added:', file.name)
})

// Upload started
uploader.on('start', (file) => {
  console.log('Started:', file.name)
})

// Progress update
uploader.on('progress', (file) => {
  console.log(\`\${file.name}: \${file.progress}%\`)
  console.log(\`Uploaded: \${file.uploadedBytes} / \${file.file.size}\`)
})

// Upload completed
uploader.on('complete', (file) => {
  console.log('Complete:', file.name)
  console.log('Response:', file.response)
})

// Upload failed
uploader.on('error', (file, error) => {
  console.error('Error:', file.name, error.message)
})

// Upload cancelled
uploader.on('cancel', (file) => {
  console.log('Cancelled:', file.name)
})

// All uploads completed
uploader.on('allComplete', () => {
  console.log('All files uploaded!')
})

// Remove event listener
const handler = (file) => console.log(file.name)
uploader.on('complete', handler)
uploader.off('complete', handler)`}
          language="typescript"
          filename="events.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Progress Tracking</h2>
        <p className="text-zinc-400 mb-4">
          Track overall upload progress across all files:
        </p>
        <CodeBlock
          code={`// Get overall progress
const progress = uploader.getProgress()

console.log({
  totalFiles: progress.totalFiles,
  completedFiles: progress.completedFiles,
  totalBytes: progress.totalBytes,
  uploadedBytes: progress.uploadedBytes,
  percentage: progress.percentage,
})

// Individual file progress is available on the file item
uploader.on('progress', (file) => {
  console.log({
    name: file.name,
    progress: file.progress,
    uploadedBytes: file.uploadedBytes,
    speed: file.speed, // bytes per second
    remainingTime: file.remainingTime, // seconds
  })
})`}
          language="typescript"
          filename="progress.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Cancel and Retry</h2>
        <p className="text-zinc-400 mb-4">
          Cancel uploads and retry failed ones:
        </p>
        <CodeBlock
          code={`// Cancel a specific upload
uploader.cancel(fileItem.id)

// Cancel all uploads
uploader.cancelAll()

// Retry a failed upload
uploader.retry(fileItem.id)

// Retry all failed uploads
uploader.retryAll()

// Configure automatic retries
const uploaderWithRetry = createUploader({
  endpoint: '/api/upload',
  retries: 3,
  retryDelay: 1000, // 1 second
})`}
          language="typescript"
          filename="cancel-retry.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">File Management</h2>
        <p className="text-zinc-400 mb-4">
          Manage files in the upload queue:
        </p>
        <CodeBlock
          code={`// Remove a file from the queue
uploader.removeFile(fileItem.id)

// Remove all files
uploader.removeAll()

// Remove completed files
const completed = uploader.getFilesByStatus('completed')
completed.forEach(file => uploader.removeFile(file.id))

// Add metadata to a file
const item = uploader.addFile(file)
item.metadata['category'] = 'documents'
item.metadata['userId'] = 123`}
          language="typescript"
          filename="file-management.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Dynamic Configuration</h2>
        <p className="text-zinc-400 mb-4">
          Use dynamic endpoints and headers:
        </p>
        <CodeBlock
          code={`// Dynamic endpoint based on file
const uploader = createUploader({
  endpoint: (file) => {
    const category = file.metadata['category'] || 'default'
    return \`/api/upload/\${category}\`
  },
})

// Dynamic headers
const uploaderWithAuth = createUploader({
  endpoint: '/api/upload',
  headers: () => ({
    'Authorization': \`Bearer \${getAuthToken()}\`,
  }),
})

// Update configuration at runtime
uploader.setConfig({
  maxFiles: 20,
  maxFileSize: 50 * 1024 * 1024, // 50MB
})

// Get current configuration
const config = uploader.getConfig()`}
          language="typescript"
          filename="dynamic-config.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Cleanup</h2>
        <p className="text-zinc-400 mb-4">
          Clean up resources when done:
        </p>
        <CodeBlock
          code={`// Destroy the uploader instance
// This cancels all uploads and removes all files
uploader.destroy()

// The uploader should not be used after destroy()`}
          language="typescript"
          filename="cleanup.ts"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">File Item Properties</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Property</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">id</code></td>
                <td className="py-3 px-4">string</td>
                <td className="py-3 px-4">Unique identifier for the file</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">file</code></td>
                <td className="py-3 px-4">File</td>
                <td className="py-3 px-4">The original File object</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">name</code></td>
                <td className="py-3 px-4">string</td>
                <td className="py-3 px-4">File name</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">status</code></td>
                <td className="py-3 px-4">FileStatus</td>
                <td className="py-3 px-4">pending | uploading | completed | error | cancelled</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">progress</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Upload progress (0-100)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">uploadedBytes</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Bytes uploaded so far</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">speed</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Upload speed in bytes/second</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">remainingTime</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Estimated remaining time in seconds</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">response</code></td>
                <td className="py-3 px-4">unknown</td>
                <td className="py-3 px-4">Server response after upload</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">error</code></td>
                <td className="py-3 px-4">FileKitError</td>
                <td className="py-3 px-4">Error object if upload failed</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">metadata</code></td>
                <td className="py-3 px-4">Record</td>
                <td className="py-3 px-4">Custom metadata object</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
