import { Link } from 'react-router-dom'
import { Upload, Image, FileText, Video, Layers, Zap } from 'lucide-react'

const examples = [
  {
    icon: Upload,
    title: 'Basic Upload',
    description: 'Simple file upload with progress tracking and validation.',
    code: `const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
})

uploader.on('progress', (file) => {
  console.log(\`\${file.name}: \${file.progress}%\`)
})

uploader.addFile(file)
uploader.uploadAll()`,
  },
  {
    icon: Image,
    title: 'Image Gallery',
    description: 'Upload images with preview thumbnails and compression.',
    code: `const uploader = createUploader({
  endpoint: '/api/upload',
  allowedTypes: ['image/*'],
})

uploader.on('add', async (file) => {
  // Generate thumbnail
  const preview = await createImagePreview(file.file, {
    maxWidth: 200,
    maxHeight: 200,
  })
  displayThumbnail(file.id, preview)

  // Compress before upload
  const compressed = await compressImage(file.file, {
    maxWidth: 1920,
    quality: 0.8,
  })
  file.file = compressed
})`,
  },
  {
    icon: Layers,
    title: 'Drag and Drop',
    description: 'Full-featured drop zone with visual feedback.',
    code: `const dropzone = createDropZone(element, {
  accept: ['image/*', 'application/pdf'],
  multiple: true,
})

dropzone.on('dragenter', () => {
  element.classList.add('drag-active')
})

dropzone.on('dragleave', () => {
  element.classList.remove('drag-active')
})

dropzone.on('drop', (files) => {
  uploader.addFiles(files)
})`,
  },
  {
    icon: Video,
    title: 'Large File Upload',
    description: 'Chunked upload for large video files with resume support.',
    code: `const uploader = createUploader({
  endpoint: '/api/upload',
  allowedTypes: ['video/*'],
  chunked: {
    enabled: true,
    chunkSize: 10 * 1024 * 1024, // 10MB
    parallel: 3,
    retries: 5,
  },
})

uploader.on('chunkComplete', (file, chunk) => {
  console.log(\`Chunk \${chunk.index + 1}/\${chunk.total}\`)
  saveProgress(file.id, chunk.index)
})`,
  },
  {
    icon: FileText,
    title: 'Form Integration',
    description: 'Integrate file uploads with form submissions.',
    code: `const form = document.querySelector('form')
const uploader = createUploader({
  endpoint: '/api/upload',
  autoUpload: false,
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Upload files first
  await uploader.uploadAll()

  // Get uploaded file IDs
  const fileIds = uploader.getFiles()
    .filter(f => f.status === 'completed')
    .map(f => f.response.id)

  // Submit form with file IDs
  submitForm({ ...formData, files: fileIds })
})`,
  },
  {
    icon: Zap,
    title: 'React Component',
    description: 'Complete React implementation with hooks.',
    code: `function FileUpload() {
  const {
    files,
    addFiles,
    uploadAll,
    progress,
    isUploading,
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
  })

  return (
    <div>
      <DropZone onDrop={addFiles}>
        Drop files here
      </DropZone>

      <FileList files={files} showPreview />

      <button onClick={uploadAll} disabled={isUploading}>
        Upload ({progress.percentage}%)
      </button>
    </div>
  )
}`,
  },
]

export default function Examples() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-white mb-4">Examples</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Explore common use cases and patterns for FileKit.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <div
              key={example.title}
              className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <div className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-4">
                  <example.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{example.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{example.description}</p>
              </div>
              <div className="bg-zinc-950 border-t border-zinc-800">
                <pre className="p-4 overflow-x-auto text-xs">
                  <code className="text-zinc-400">{example.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-400 mb-4">
            Ready to build something amazing?
          </p>
          <Link
            to="/docs/getting-started"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
