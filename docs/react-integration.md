# React Integration

FileKit provides React-specific components and hooks for easy integration with React applications.

## Installation

```bash
npm install @anthropic/filekit
```

## Quick Start

```tsx
import { DropZone } from '@anthropic/filekit/react'

function App() {
  return (
    <DropZone
      endpoint="/api/upload"
      onUploadComplete={(file, response) => {
        console.log('Uploaded:', file.name)
      }}
    >
      <p>Drop files here or click to select</p>
    </DropZone>
  )
}
```

## Components

### DropZone

A ready-to-use drop zone component with full drag & drop support.

```tsx
import { DropZone } from '@anthropic/filekit/react'

<DropZone
  // Required
  endpoint="/api/upload"

  // File restrictions
  maxFileSize={10 * 1024 * 1024}
  allowedTypes={['image/*', 'application/pdf']}
  maxFiles={5}
  multiple={true}

  // Upload behavior
  autoUpload={true}
  chunked={false}

  // Styling
  className="dropzone"
  activeClassName="dropzone-active"
  acceptClassName="dropzone-accept"
  rejectClassName="dropzone-reject"

  // Callbacks
  onFilesAdded={(files) => console.log('Added:', files)}
  onUploadStart={(file) => console.log('Starting:', file.name)}
  onUploadProgress={({ file, percentage }) => console.log(`${percentage}%`)}
  onUploadComplete={(file, response) => console.log('Done:', file.name)}
  onUploadError={(file, error) => console.error('Failed:', error)}
  onAllComplete={(files) => console.log('All done!')}
>
  {/* Static children */}
  <p>Drop files here</p>
</DropZone>
```

### Render Props Pattern

For more control over the UI, use render props:

```tsx
<DropZone endpoint="/api/upload">
  {({ isDragActive, isDragAccept, isDragReject, files, progress, open }) => (
    <div className={isDragActive ? 'active' : ''}>
      {isDragActive ? (
        isDragAccept ? (
          <p>Drop to upload!</p>
        ) : (
          <p>File type not accepted</p>
        )
      ) : (
        <p>Drag files or click to select</p>
      )}

      <button onClick={open}>Select Files</button>

      <p>
        {progress.completed}/{progress.total} files uploaded
        ({progress.percentage}%)
      </p>

      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.name} - {file.status} ({file.progress}%)
          </li>
        ))}
      </ul>
    </div>
  )}
</DropZone>
```

## Hooks

### useUploader

For complete control, use the `useUploader` hook:

```tsx
import { useUploader } from '@anthropic/filekit/react'

function CustomUploader() {
  const {
    // File list
    files,

    // Actions
    addFile,
    addFiles,
    removeFile,
    removeAll,

    // Upload control
    upload,
    uploadAll,
    pause,
    resume,
    cancel,
    retry,

    // State
    isUploading,
    progress,
  } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
    onComplete: (file) => console.log('Done:', file.name),
    onError: (file, error) => console.error('Failed:', error),
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />

      <div>
        <button onClick={uploadAll} disabled={isUploading}>
          Upload All
        </button>
        <button onClick={() => pause()}>Pause</button>
        <button onClick={() => resume()}>Resume</button>
        <button onClick={removeAll}>Clear</button>
      </div>

      <p>Progress: {progress.percentage}%</p>

      {files.map(file => (
        <div key={file.id}>
          <span>{file.name}</span>
          <span>{file.status}</span>
          <progress value={file.progress} max={100} />

          <button onClick={() => upload(file.id)}>Upload</button>
          <button onClick={() => cancel(file.id)}>Cancel</button>
          <button onClick={() => removeFile(file.id)}>Remove</button>
        </div>
      ))}
    </div>
  )
}
```

### useDropZone

Low-level hook for building custom drop zones:

```tsx
import { useDropZone } from '@anthropic/filekit/react'

function CustomDropZone() {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    files,
    open,
    uploader,
  } = useDropZone({
    endpoint: '/api/upload',
    allowedTypes: ['image/*'],
  })

  return (
    <div {...getRootProps()} className={isDragActive ? 'active' : ''}>
      <input {...getInputProps()} />
      <p>Drag images here</p>
      <button onClick={open}>Select</button>
    </div>
  )
}
```

## TypeScript Support

All components and hooks are fully typed:

```tsx
import type { FileItem, UploadProgress, UploadError } from '@anthropic/filekit'
import { useUploader } from '@anthropic/filekit/react'

function TypedExample() {
  const { files } = useUploader({
    endpoint: '/api/upload',
    onProgress: (progress: UploadProgress) => {
      console.log(progress.percentage)
    },
    onComplete: (file: FileItem, response: unknown) => {
      console.log(file.name, response)
    },
    onError: (file: FileItem, error: UploadError) => {
      console.error(error.code, error.message)
    },
  })

  return (
    <ul>
      {files.map((file: FileItem) => (
        <li key={file.id}>{file.name}</li>
      ))}
    </ul>
  )
}
```

## Styling Examples

### CSS Classes

```css
.dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dropzone:hover,
.dropzone-active {
  border-color: #007bff;
  background: #f0f7ff;
}

.dropzone-accept {
  border-color: #28a745;
  background: #f0fff4;
}

.dropzone-reject {
  border-color: #dc3545;
  background: #fff5f5;
}
```

### Styled Components

```tsx
import styled from 'styled-components'
import { DropZone } from '@anthropic/filekit/react'

const StyledDropZone = styled(DropZone)`
  border: 2px dashed ${props => props.theme.border};
  border-radius: 8px;
  padding: 40px;

  &.active {
    border-color: ${props => props.theme.primary};
  }
`
```

### Tailwind CSS

```tsx
<DropZone
  endpoint="/api/upload"
  className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer transition-colors hover:border-blue-500"
  activeClassName="border-blue-500 bg-blue-50"
  acceptClassName="border-green-500 bg-green-50"
  rejectClassName="border-red-500 bg-red-50"
>
  <p className="text-gray-500">Drop files here</p>
</DropZone>
```

## Best Practices

1. **Handle all states**: Always handle loading, success, and error states for good UX.

2. **Show progress**: Display upload progress with a progress bar or percentage.

3. **Allow cancellation**: Let users cancel uploads, especially for large files.

4. **Validate early**: Use `allowedTypes` and `maxFileSize` to validate before upload.

5. **Provide feedback**: Show clear messages for drag states and validation errors.

6. **Clean up**: Remove completed files from the list or provide a way to dismiss them.
