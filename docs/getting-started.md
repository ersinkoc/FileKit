# Getting Started

This guide will help you get started with FileKit in your project.

## Installation

```bash
npm install @oxog/filekit
# or
yarn add @oxog/filekit
# or
pnpm add @oxog/filekit
```

## Basic Usage

### Vanilla JavaScript/TypeScript

```typescript
import { createUploader } from '@oxog/filekit'

// Create an uploader instance
const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
})

// Listen to events
uploader.on('progress', (progress) => {
  console.log(`${progress.file.name}: ${progress.percentage}%`)
})

uploader.on('complete', (file, response) => {
  console.log(`Uploaded: ${file.name}`, response)
})

uploader.on('error', (file, error) => {
  console.error(`Failed: ${file.name}`, error.message)
})

// Add files (from input element or drag & drop)
const input = document.querySelector('input[type="file"]')
input.addEventListener('change', (e) => {
  uploader.addFiles(e.target.files)
})

// Upload all files
document.querySelector('#upload-btn').addEventListener('click', () => {
  uploader.upload()
})
```

### React

```tsx
import { useUploader, DropZone, FileList } from '@oxog/filekit/react'

function FileUpload() {
  const {
    files,
    addFiles,
    upload,
    removeFile,
    progress,
    isUploading
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
  })

  return (
    <div>
      <DropZone onDrop={addFiles}>
        {({ isDragActive }) => (
          <div className={isDragActive ? 'drag-active' : ''}>
            {isDragActive ? 'Drop files here...' : 'Drag files or click to browse'}
          </div>
        )}
      </DropZone>

      <FileList
        files={files}
        onRemove={removeFile}
        showPreview
        showProgress
      />

      <button onClick={() => upload()} disabled={isUploading || files.length === 0}>
        {isUploading ? `Uploading... ${progress.percentage}%` : 'Upload All'}
      </button>
    </div>
  )
}
```

## Drop Zone

Create a drop zone for drag & drop file uploads:

```typescript
import { createDropZone } from '@oxog/filekit'

const element = document.getElementById('drop-zone')

const dropZone = createDropZone(element, {
  endpoint: '/api/upload',
  allowedTypes: ['image/*'],
  onDrop: (files) => {
    console.log('Files dropped:', files)
  },
})

// Open file dialog programmatically
document.querySelector('#browse-btn').addEventListener('click', () => {
  dropZone.open()
})

// Cleanup when done
dropZone.destroy()
```

## Validation

FileKit includes built-in validators:

```typescript
import { createUploader, createValidator } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',

  // Built-in validation
  maxFileSize: 5 * 1024 * 1024, // 5MB
  minFileSize: 1024, // 1KB minimum
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  blockedTypes: ['image/gif'],
  maxFiles: 10,

  // Image dimension validation
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  minImageWidth: 100,
  minImageHeight: 100,

  // Custom validators
  validators: [
    createValidator('unique-name', async (file, existingFiles) => {
      if (existingFiles.some(f => f.name === file.name)) {
        throw new Error('File with this name already exists')
      }
    }),
  ],
})
```

## Chunked Uploads

For large files, enable chunked uploads:

```typescript
import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  chunked: true,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  parallelChunks: 3,
  retryChunks: 3,
  chunkEndpoint: '/api/upload/chunk',
  mergeEndpoint: '/api/upload/merge',
})

uploader.on('chunkComplete', (file, chunkIndex, totalChunks) => {
  console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`)
})
```

## Image Preview

Generate previews for image files:

```typescript
import { createImagePreview, compressImage, getImageDimensions } from '@oxog/filekit'

// Create preview URL
const previewUrl = await createImagePreview(file, {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
})

// Get image dimensions
const { width, height } = await getImageDimensions(file)

// Compress image
const compressedFile = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  type: 'image/jpeg',
})
```

## Next Steps

- [Upload Configuration](./upload.md)
- [Drop Zone Guide](./dropzone.md)
- [Validation](./validation.md)
- [Chunked Uploads](./chunked.md)
- [React Integration](./react.md)
- [API Reference](./api.md)
