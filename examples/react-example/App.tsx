import React from 'react'
import { DropZone, useUploader, formatFileSize } from '@anthropic/filekit/react'
import type { FileItem } from '@anthropic/filekit'

// Example 1: Using DropZone component with render props
function DropZoneExample() {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2>DropZone Component</h2>

      <DropZone
        endpoint="/api/upload"
        maxFileSize={10 * 1024 * 1024}
        allowedTypes={['image/*', 'application/pdf']}
        autoUpload={true}
        className="dropzone"
        activeClassName="dropzone-active"
        acceptClassName="dropzone-accept"
        rejectClassName="dropzone-reject"
        onFilesAdded={(files) => console.log('Files added:', files)}
        onUploadComplete={(file, response) => console.log('Complete:', file.name)}
        onUploadError={(file, error) => console.error('Error:', file.name, error)}
      >
        {({ isDragActive, isDragAccept, isDragReject, files, progress, open }) => (
          <div style={{ padding: 40, textAlign: 'center' }}>
            {isDragActive ? (
              isDragAccept ? (
                <p style={{ color: 'green' }}>Drop files here...</p>
              ) : (
                <p style={{ color: 'red' }}>Some files are not allowed</p>
              )
            ) : (
              <p>Drag & drop files here or click to select</p>
            )}

            <button onClick={open} style={{ marginTop: 10 }}>
              Select Files
            </button>

            {files.length > 0 && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p>
                  Progress: {progress.percentage}% ({progress.completed}/{progress.total} files)
                </p>
                <FileList files={files} />
              </div>
            )}
          </div>
        )}
      </DropZone>
    </div>
  )
}

// Example 2: Using useUploader hook for more control
function UploaderHookExample() {
  const {
    files,
    addFiles,
    upload,
    uploadAll,
    pause,
    resume,
    cancel,
    retry,
    removeFile,
    removeAll,
    isUploading,
    progress,
  } = useUploader({
    endpoint: '/api/upload',
    chunked: true,
    chunkSize: 2 * 1024 * 1024,
    onComplete: (file) => console.log('Completed:', file.name),
    onError: (file, error) => console.error('Failed:', file.name, error),
    onAllComplete: (files) => console.log('All done!', files.length, 'files'),
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <h2>useUploader Hook</h2>

      <div style={{ marginBottom: 20 }}>
        <input type="file" multiple onChange={handleFileSelect} />
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button onClick={uploadAll} disabled={isUploading || files.length === 0}>
          Upload All
        </button>
        <button onClick={() => pause()} disabled={!isUploading}>
          Pause All
        </button>
        <button onClick={() => resume()}>
          Resume All
        </button>
        <button onClick={removeAll} disabled={files.length === 0}>
          Clear All
        </button>
      </div>

      {files.length > 0 && (
        <div>
          <p>
            Overall: {progress.percentage}% |
            {formatFileSize(progress.uploadedBytes)} / {formatFileSize(progress.totalBytes)}
          </p>

          {files.map(file => (
            <FileItemRow
              key={file.id}
              file={file}
              onUpload={() => upload(file.id)}
              onPause={() => pause(file.id)}
              onResume={() => resume(file.id)}
              onCancel={() => cancel(file.id)}
              onRetry={() => retry(file.id)}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Shared components
function FileList({ files }: { files: FileItem[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {files.map(file => (
        <li key={file.id} style={{
          padding: 10,
          marginBottom: 5,
          background: '#f5f5f5',
          borderRadius: 4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{file.name}</span>
            <span>{file.status}</span>
          </div>
          <div style={{
            height: 4,
            background: '#ddd',
            borderRadius: 2,
            marginTop: 5
          }}>
            <div style={{
              width: `${file.progress}%`,
              height: '100%',
              background: file.status === 'error' ? '#dc3545' : '#007bff',
              borderRadius: 2,
              transition: 'width 0.2s'
            }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function FileItemRow({
  file,
  onUpload,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove
}: {
  file: FileItem
  onUpload: () => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onRetry: () => void
  onRemove: () => void
}) {
  return (
    <div style={{
      padding: 15,
      border: '1px solid #ddd',
      borderRadius: 8,
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <strong>{file.name}</strong>
          <span style={{ color: '#666', marginLeft: 10 }}>
            {formatFileSize(file.size)}
          </span>
        </div>
        <span style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          background: getStatusColor(file.status),
          color: 'white'
        }}>
          {file.status}
        </span>
      </div>

      <div style={{
        height: 6,
        background: '#eee',
        borderRadius: 3,
        marginBottom: 10
      }}>
        <div style={{
          width: `${file.progress}%`,
          height: '100%',
          background: '#007bff',
          borderRadius: 3,
          transition: 'width 0.2s'
        }} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {file.status === 'pending' && (
          <button onClick={onUpload}>Upload</button>
        )}
        {file.status === 'uploading' && (
          <button onClick={onPause}>Pause</button>
        )}
        {file.status === 'paused' && (
          <button onClick={onResume}>Resume</button>
        )}
        {file.status === 'error' && (
          <button onClick={onRetry}>Retry</button>
        )}
        {['pending', 'uploading', 'paused'].includes(file.status) && (
          <button onClick={onCancel}>Cancel</button>
        )}
        <button onClick={onRemove}>Remove</button>
      </div>

      {file.error && (
        <p style={{ color: '#dc3545', marginTop: 10, fontSize: 14 }}>
          Error: {file.error.message}
        </p>
      )}
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#28a745'
    case 'error': return '#dc3545'
    case 'uploading': return '#007bff'
    case 'paused': return '#ffc107'
    default: return '#6c757d'
  }
}

// Main App
export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>FileKit React Examples</h1>

      <style>{`
        .dropzone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropzone-active { border-color: #007bff; background: #f0f7ff; }
        .dropzone-accept { border-color: #28a745; background: #f0fff4; }
        .dropzone-reject { border-color: #dc3545; background: #fff5f5; }
      `}</style>

      <DropZoneExample />
      <UploaderHookExample />
    </div>
  )
}
