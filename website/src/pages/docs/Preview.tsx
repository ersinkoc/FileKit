import CodeBlock from '../../components/CodeBlock'

export default function Preview() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Preview</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Generate image previews, thumbnails, and get file metadata before upload.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Image Preview</h2>
        <p className="text-zinc-400 mb-4">
          Generate a preview URL for image files:
        </p>
        <CodeBlock
          code={`import { createImagePreview } from '@oxog/filekit'

// Create a preview from a File object
const previewUrl = await createImagePreview(imageFile)

// Use in an <img> element
const img = document.createElement('img')
img.src = previewUrl

// Don't forget to revoke when done to free memory
URL.revokeObjectURL(previewUrl)`}
          language="typescript"
          filename="preview.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Preview Options</h2>
        <p className="text-zinc-400 mb-4">
          Customize the preview with options:
        </p>
        <CodeBlock
          code={`import { createImagePreview } from '@oxog/filekit'

const previewUrl = await createImagePreview(imageFile, {
  maxWidth: 300,    // Maximum preview width
  maxHeight: 300,   // Maximum preview height
  quality: 0.8,     // JPEG quality (0-1)
  type: 'image/jpeg', // Output format
})

// Create a square thumbnail
const thumbnailUrl = await createImagePreview(imageFile, {
  maxWidth: 100,
  maxHeight: 100,
  quality: 0.7,
})`}
          language="typescript"
          filename="options.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Image Dimensions</h2>
        <p className="text-zinc-400 mb-4">
          Get the dimensions of an image file:
        </p>
        <CodeBlock
          code={`import { getImageDimensions } from '@oxog/filekit'

const dimensions = await getImageDimensions(imageFile)

console.log({
  width: dimensions.width,
  height: dimensions.height,
  aspectRatio: dimensions.width / dimensions.height,
})

// Use for validation
if (dimensions.width < 800 || dimensions.height < 600) {
  throw new Error('Image must be at least 800x600 pixels')
}`}
          language="typescript"
          filename="dimensions.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Image Compression</h2>
        <p className="text-zinc-400 mb-4">
          Compress images before upload to reduce file size:
        </p>
        <CodeBlock
          code={`import { compressImage } from '@oxog/filekit'

// Compress an image file
const compressedFile = await compressImage(imageFile, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  type: 'image/jpeg',
})

console.log({
  original: imageFile.size,
  compressed: compressedFile.size,
  reduction: Math.round((1 - compressedFile.size / imageFile.size) * 100) + '%',
})

// Upload the compressed file instead
uploader.addFile(compressedFile)`}
          language="typescript"
          filename="compress.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Reading File Contents</h2>
        <p className="text-zinc-400 mb-4">
          Read file contents as different formats:
        </p>
        <CodeBlock
          code={`import {
  readAsDataURL,
  readAsText,
  readAsArrayBuffer,
} from '@oxog/filekit'

// Read as Data URL (for images, display in <img>)
const dataUrl = await readAsDataURL(imageFile)
img.src = dataUrl

// Read as text (for text files)
const textContent = await readAsText(textFile)
console.log(textContent)

// Read with specific encoding
const utf16Content = await readAsText(textFile, 'UTF-16')

// Read as ArrayBuffer (for binary processing)
const buffer = await readAsArrayBuffer(binaryFile)
const bytes = new Uint8Array(buffer)`}
          language="typescript"
          filename="reading.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">File Utilities</h2>
        <p className="text-zinc-400 mb-4">
          Helpful utilities for working with files:
        </p>
        <CodeBlock
          code={`import {
  isImage,
  isVideo,
  getFileExtension,
  getFileCategory,
  formatFileSize,
  parseFileSize,
} from '@oxog/filekit'

// Check file type
console.log(isImage(file)) // true for image/*
console.log(isVideo(file)) // true for video/*

// Get file extension
console.log(getFileExtension('photo.jpg')) // 'jpg'
console.log(getFileExtension('document.pdf')) // 'pdf'

// Get file category
console.log(getFileCategory(imageFile)) // 'image'
console.log(getFileCategory(videoFile)) // 'video'
console.log(getFileCategory(pdfFile)) // 'document'

// Format file size for display
console.log(formatFileSize(1024)) // '1 KB'
console.log(formatFileSize(1536000)) // '1.5 MB'
console.log(formatFileSize(1073741824)) // '1 GB'

// Parse file size string to bytes
console.log(parseFileSize('10 MB')) // 10485760
console.log(parseFileSize('1.5 GB')) // 1610612736`}
          language="typescript"
          filename="utilities.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Preview with Uploader</h2>
        <p className="text-zinc-400 mb-4">
          Combine preview generation with the uploader:
        </p>
        <CodeBlock
          code={`import { createUploader, createImagePreview, isImage } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
})

const previews = new Map()

// Generate preview when image is added
uploader.on('add', async (file) => {
  if (isImage(file.file)) {
    const previewUrl = await createImagePreview(file.file, {
      maxWidth: 200,
      maxHeight: 200,
    })
    previews.set(file.id, previewUrl)
    renderFileList()
  }
})

// Clean up preview when file is removed
uploader.on('remove', (file) => {
  const previewUrl = previews.get(file.id)
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl)
    previews.delete(file.id)
  }
})

// Render file list with previews using safe DOM methods
function renderFileList() {
  const fileList = document.getElementById('file-list')
  fileList.replaceChildren() // Clear existing content safely

  uploader.getFiles().forEach(file => {
    const div = document.createElement('div')
    div.className = 'file-item'

    const preview = previews.get(file.id)
    if (preview) {
      const img = document.createElement('img')
      img.src = preview
      img.alt = file.name
      div.appendChild(img)
    }

    const span = document.createElement('span')
    span.textContent = file.name
    div.appendChild(span)

    fileList.appendChild(div)
  })
}`}
          language="typescript"
          filename="with-uploader.ts"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Video Thumbnails</h2>
        <p className="text-zinc-400 mb-4">
          Generate thumbnails from video files:
        </p>
        <CodeBlock
          code={`import { createVideoThumbnail } from '@oxog/filekit'

// Get thumbnail at 1 second mark
const thumbnailUrl = await createVideoThumbnail(videoFile, {
  time: 1, // seconds
  maxWidth: 300,
  maxHeight: 200,
})

// Get thumbnail at 25% of video duration
const thumbnailUrl2 = await createVideoThumbnail(videoFile, {
  position: 0.25, // 0-1 representing position in video
  maxWidth: 300,
})`}
          language="typescript"
          filename="video.ts"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Memory Management</h2>
        <p className="text-zinc-400 mb-4">
          Important tips for managing memory with previews:
        </p>
        <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
          <li>Always call <code className="text-violet-400">URL.revokeObjectURL()</code> when done with preview URLs</li>
          <li>Generate previews lazily (only when visible) for large file lists</li>
          <li>Use smaller preview sizes to reduce memory usage</li>
          <li>Clean up previews when files are removed from the queue</li>
        </ul>
        <CodeBlock
          code={`// Good practice: cleanup previews
const previewUrls = []

function addPreview(file) {
  const url = URL.createObjectURL(file)
  previewUrls.push(url)
  return url
}

function cleanup() {
  previewUrls.forEach(url => URL.revokeObjectURL(url))
  previewUrls.length = 0
}

// Cleanup when component unmounts or page unloads
window.addEventListener('beforeunload', cleanup)`}
          language="typescript"
          filename="memory.ts"
        />
      </section>
    </div>
  )
}
