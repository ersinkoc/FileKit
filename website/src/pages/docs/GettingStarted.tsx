import CodeBlock from '../../components/CodeBlock'

export default function GettingStarted() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Getting Started</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Learn how to install and use FileKit in your project.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Installation</h2>
        <p className="text-zinc-400 mb-4">
          Install FileKit using your preferred package manager:
        </p>
        <div className="space-y-4">
          <CodeBlock code="npm install @oxog/filekit" language="bash" filename="npm" />
          <CodeBlock code="yarn add @oxog/filekit" language="bash" filename="yarn" />
          <CodeBlock code="pnpm add @oxog/filekit" language="bash" filename="pnpm" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Start</h2>
        <p className="text-zinc-400 mb-4">
          Create an uploader instance and start uploading files:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

// Create an uploader instance
const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  maxFiles: 5,
})

// Listen to events
uploader.on('add', (file) => {
  console.log('File added:', file.name)
})

uploader.on('progress', (file) => {
  console.log(\`\${file.name}: \${file.progress}%\`)
})

uploader.on('complete', (file) => {
  console.log('Upload complete:', file.name, file.response)
})

uploader.on('error', (file, error) => {
  console.error('Upload failed:', file.name, error.message)
})

// Add files from an input element
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', (e) => {
  const files = Array.from(e.target.files)
  uploader.addFiles(files)
})

// Upload all files
uploader.uploadAll()`}
          language="typescript"
          filename="index.ts"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">React Quick Start</h2>
        <p className="text-zinc-400 mb-4">
          FileKit provides first-class React support with hooks and components:
        </p>
        <CodeBlock
          code={`import { useUploader, DropZone, FileList } from '@oxog/filekit/react'

function FileUpload() {
  const {
    files,
    addFiles,
    uploadAll,
    removeFile,
    progress,
    isUploading,
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*'],
  })

  return (
    <div className="upload-container">
      <DropZone onDrop={addFiles} accept="image/*" multiple>
        {({ isDragActive }) => (
          <div className={isDragActive ? 'active' : ''}>
            {isDragActive
              ? 'Drop files here...'
              : 'Drag files here or click to browse'}
          </div>
        )}
      </DropZone>

      <FileList
        files={files}
        onRemove={removeFile}
        showPreview
        showProgress
      />

      <button
        onClick={uploadAll}
        disabled={isUploading || files.length === 0}
      >
        {isUploading
          ? \`Uploading... \${progress.percentage}%\`
          : 'Upload All'}
      </button>
    </div>
  )
}

export default FileUpload`}
          language="tsx"
          filename="FileUpload.tsx"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Configuration</h2>
        <p className="text-zinc-400 mb-4">
          FileKit is highly configurable. Here are the main options:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Option</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Default</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">endpoint</code></td>
                <td className="py-3 px-4">string | function</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Upload endpoint URL or function returning URL</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFileSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
                <td className="py-3 px-4">Maximum file size in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">allowedTypes</code></td>
                <td className="py-3 px-4">string[]</td>
                <td className="py-3 px-4">['*/*']</td>
                <td className="py-3 px-4">Allowed MIME types (supports wildcards)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFiles</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
                <td className="py-3 px-4">Maximum number of files</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">autoUpload</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Automatically upload files when added</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">sequential</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Upload files one at a time</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">headers</code></td>
                <td className="py-3 px-4">object | function</td>
                <td className="py-3 px-4">{'{}'}</td>
                <td className="py-3 px-4">Custom headers to include with upload</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">withCredentials</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Include cookies in cross-origin requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Browser Support</h2>
        <p className="text-zinc-400 mb-4">
          FileKit supports all modern browsers:
        </p>
        <ul className="list-disc list-inside text-zinc-400 space-y-2">
          <li>Chrome 60+</li>
          <li>Firefox 55+</li>
          <li>Safari 12+</li>
          <li>Edge 79+</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Next Steps</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/docs/upload"
            className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors"
          >
            <h3 className="text-white font-medium mb-1">Upload Guide</h3>
            <p className="text-zinc-400 text-sm">Learn about upload configuration and events</p>
          </a>
          <a
            href="/docs/dropzone"
            className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors"
          >
            <h3 className="text-white font-medium mb-1">Drop Zone</h3>
            <p className="text-zinc-400 text-sm">Add drag and drop file uploads</p>
          </a>
          <a
            href="/docs/validation"
            className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors"
          >
            <h3 className="text-white font-medium mb-1">Validation</h3>
            <p className="text-zinc-400 text-sm">Validate files before upload</p>
          </a>
          <a
            href="/docs/react"
            className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors"
          >
            <h3 className="text-white font-medium mb-1">React Integration</h3>
            <p className="text-zinc-400 text-sm">Use hooks and components in React</p>
          </a>
        </div>
      </section>
    </div>
  )
}
