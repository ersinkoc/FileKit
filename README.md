# FileKit

Zero-dependency file upload toolkit with drag & drop, chunked transfers, progress tracking, and first-class React support.

[![npm version](https://img.shields.io/npm/v/@oxog/filekit.svg)](https://www.npmjs.com/package/@oxog/filekit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@oxog/filekit)](https://bundlephobia.com/package/@oxog/filekit)
[![license](https://img.shields.io/npm/l/@oxog/filekit.svg)](https://github.com/ersinkoc/filekit/blob/main/LICENSE)

## Features

- **Zero Dependencies** - No external runtime dependencies
- **TypeScript First** - Written in strict TypeScript with complete type definitions
- **Small Bundle** - Core < 4KB, with React < 6KB (minified + gzipped)
- **Drag & Drop** - Built-in drop zone with visual feedback
- **Chunked Uploads** - Upload large files in chunks with parallel transfers
- **Progress Tracking** - Real-time upload progress with speed and ETA
- **Validation** - File size, type, and custom validators
- **Image Preview** - Generate thumbnails and compress images
- **React Integration** - First-class hooks and components

## Installation

```bash
npm install @oxog/filekit
```

## Quick Start

### Vanilla JavaScript

```typescript
import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
})

uploader.on('progress', (file) => {
  console.log(`${file.name}: ${file.progress}%`)
})

uploader.on('complete', (file) => {
  console.log(`Uploaded: ${file.name}`)
})

// Add files and upload
uploader.addFiles(files)
uploader.uploadAll()
```

### React

```tsx
import { useUploader, DropZone, FileList } from '@oxog/filekit/react'

function FileUpload() {
  const { files, addFiles, uploadAll, progress, isUploading } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
  })

  return (
    <div>
      <DropZone onDrop={addFiles}>
        {({ isDragActive }) => (
          <div>{isDragActive ? 'Drop files here...' : 'Drag files here or click to browse'}</div>
        )}
      </DropZone>

      <FileList files={files} showPreview showProgress />

      <button onClick={uploadAll} disabled={isUploading}>
        {isUploading ? `Uploading... ${progress.percentage}%` : 'Upload All'}
      </button>
    </div>
  )
}
```

## Documentation

Visit [filekit.oxog.dev](https://filekit.oxog.dev) for full documentation.

- [Getting Started](https://filekit.oxog.dev/docs/getting-started)
- [Upload Guide](https://filekit.oxog.dev/docs/upload)
- [Drop Zone](https://filekit.oxog.dev/docs/dropzone)
- [Validation](https://filekit.oxog.dev/docs/validation)
- [Chunked Upload](https://filekit.oxog.dev/docs/chunked)
- [Preview](https://filekit.oxog.dev/docs/preview)
- [React Integration](https://filekit.oxog.dev/docs/react)
- [API Reference](https://filekit.oxog.dev/docs/api)

## API Overview

### Core Functions

```typescript
import {
  createUploader,
  createDropZone,
  createValidator,
  createUploadQueue,
} from '@oxog/filekit'
```

### Preview Functions

```typescript
import {
  createImagePreview,
  getImageDimensions,
  compressImage,
} from '@oxog/filekit'
```

### Utility Functions

```typescript
import {
  isImage,
  isVideo,
  formatFileSize,
  parseFileSize,
  getFileExtension,
  readAsDataURL,
  readAsText,
} from '@oxog/filekit'
```

### React Hooks

```typescript
import {
  useUploader,
  useDropZone,
  useFileSelect,
  useImagePreview,
} from '@oxog/filekit/react'
```

### React Components

```typescript
import {
  DropZone,
  FileInput,
  FileList,
  UploadProgress,
  ImagePreview,
} from '@oxog/filekit/react'
```

## Configuration

### Uploader Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string \| function` | Required | Upload URL |
| `maxFileSize` | `number` | `Infinity` | Max file size in bytes |
| `allowedTypes` | `string[]` | `['*/*']` | Allowed MIME types |
| `maxFiles` | `number` | `Infinity` | Max number of files |
| `autoUpload` | `boolean` | `false` | Auto upload when files added |
| `sequential` | `boolean` | `false` | Upload files one at a time |
| `headers` | `object \| function` | `{}` | Custom request headers |
| `withCredentials` | `boolean` | `false` | Include cookies in requests |
| `retries` | `number` | `0` | Number of retry attempts |
| `chunked` | `ChunkedConfig` | - | Chunked upload configuration |

### Chunked Upload Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable chunked uploads |
| `chunkSize` | `number` | `5MB` | Size of each chunk |
| `parallel` | `number` | `3` | Parallel chunk uploads |
| `retries` | `number` | `3` | Retries per chunk |
| `minSize` | `number` | `10MB` | Min file size for chunking |

## Events

### Uploader Events

```typescript
uploader.on('add', (file) => {})
uploader.on('start', (file) => {})
uploader.on('progress', (file) => {})
uploader.on('complete', (file) => {})
uploader.on('error', (file, error) => {})
uploader.on('cancel', (file) => {})
uploader.on('allComplete', () => {})
```

### Drop Zone Events

```typescript
dropzone.on('drop', (files) => {})
dropzone.on('dragenter', () => {})
dropzone.on('dragleave', () => {})
dropzone.on('error', (error) => {})
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
