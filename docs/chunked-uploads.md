# Chunked Uploads

FileKit supports chunked uploads for handling large files efficiently. This guide covers how to configure and use chunked uploads.

## Overview

Chunked uploads split large files into smaller pieces and upload them in parallel. This provides:

- **Resumable uploads**: If a connection drops, only the failed chunks need to be re-uploaded
- **Better reliability**: Smaller requests are less likely to fail
- **Parallel uploads**: Multiple chunks can be uploaded simultaneously
- **Progress granularity**: More accurate progress tracking

## Basic Configuration

```typescript
import { createUploader } from '@anthropic/filekit'

const uploader = createUploader({
  endpoint: '/api/upload/chunk',
  chunked: true,
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  parallelChunks: 3,          // Upload 3 chunks at a time
  retryChunks: 3,             // Retry failed chunks 3 times
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chunked` | `boolean` | `false` | Enable chunked uploads |
| `chunkSize` | `number` | `5242880` | Size of each chunk in bytes (5MB) |
| `parallelChunks` | `number` | `3` | Number of chunks to upload in parallel |
| `retryChunks` | `number` | `3` | Number of retry attempts per failed chunk |

## Server Requirements

Your server needs to handle chunked uploads. Each chunk request includes:

### Request Headers

```
Content-Range: bytes {start}-{end}/{total}
X-Chunk-Index: {chunkIndex}
X-Total-Chunks: {totalChunks}
X-File-Id: {fileId}
X-File-Name: {fileName}
```

### Example Server Handler (Express)

```javascript
const chunks = new Map()

app.post('/api/upload/chunk', (req, res) => {
  const fileId = req.headers['x-file-id']
  const chunkIndex = parseInt(req.headers['x-chunk-index'])
  const totalChunks = parseInt(req.headers['x-total-chunks'])
  const fileName = req.headers['x-file-name']

  // Store chunk
  if (!chunks.has(fileId)) {
    chunks.set(fileId, { received: new Set(), data: [] })
  }

  const fileChunks = chunks.get(fileId)
  fileChunks.received.add(chunkIndex)
  fileChunks.data[chunkIndex] = req.body

  // Check if all chunks received
  if (fileChunks.received.size === totalChunks) {
    // Combine chunks and save file
    const fileData = Buffer.concat(fileChunks.data)
    fs.writeFileSync(`uploads/${fileName}`, fileData)
    chunks.delete(fileId)

    res.json({ success: true, message: 'Upload complete' })
  } else {
    res.json({ success: true, chunksReceived: fileChunks.received.size })
  }
})
```

## Tracking Progress

Chunked uploads emit additional events for granular progress tracking:

```typescript
uploader.on('chunkComplete', (file, chunkIndex, totalChunks) => {
  console.log(`Chunk ${chunkIndex + 1}/${totalChunks} complete`)
})

uploader.on('progress', (progress) => {
  console.log(`${progress.percentage}% - ${progress.currentChunk}/${progress.totalChunks}`)
})
```

## Pause and Resume

Chunked uploads support pause and resume functionality:

```typescript
// Pause upload
uploader.pause(fileId)

// Resume upload - continues from the last successful chunk
uploader.resume(fileId)
```

## Saving and Restoring State

For true resumability across sessions, you can save and restore upload state:

```typescript
// Get current state
const state = uploader.getState(fileId)

// Save to localStorage
localStorage.setItem(`upload-${fileId}`, JSON.stringify(state))

// Later, restore state
const savedState = JSON.parse(localStorage.getItem(`upload-${fileId}`))
uploader.resumeFromState(fileId, savedState)
```

### UploadState Structure

```typescript
interface UploadState {
  fileId: string
  fileName: string
  fileSize: number
  chunkSize: number
  uploadedChunks: number[]  // Indices of completed chunks
  totalChunks: number
}
```

## Best Practices

1. **Choose appropriate chunk size**: 1-10MB is typically optimal. Larger chunks mean fewer requests but more data to re-upload on failure.

2. **Match parallel chunks to connection**: 3-5 parallel chunks works well for most connections. Too many can overwhelm slower connections.

3. **Implement server-side chunk tracking**: The server should track which chunks have been received to support resume.

4. **Handle partial uploads**: Implement cleanup for incomplete uploads that are abandoned.

5. **Use unique file IDs**: FileKit generates unique IDs, but you may want to include user-specific prefixes for your server.

## Example: Full Implementation

```typescript
import { createUploader, formatFileSize } from '@anthropic/filekit'

const uploader = createUploader({
  endpoint: '/api/upload/chunk',
  chunked: true,
  chunkSize: 5 * 1024 * 1024,
  parallelChunks: 3,
  retryChunks: 3,
})

// Track progress
uploader.on('progress', (progress) => {
  const { file, percentage, currentChunk, totalChunks, speed, remainingTime } = progress
  console.log(`${file.name}: ${percentage}%`)
  console.log(`Chunk ${currentChunk}/${totalChunks}`)
  console.log(`Speed: ${formatFileSize(speed)}/s`)
  console.log(`ETA: ${Math.round(remainingTime)}s`)
})

// Handle chunk completion
uploader.on('chunkComplete', (file, chunkIndex, totalChunks) => {
  // Save state for resumability
  const state = uploader.getState(file.id)
  localStorage.setItem(`upload-${file.id}`, JSON.stringify(state))
})

// Handle completion
uploader.on('complete', (file) => {
  console.log(`Upload complete: ${file.name}`)
  localStorage.removeItem(`upload-${file.id}`)
})

// Handle errors
uploader.on('error', (file, error) => {
  console.error(`Upload failed: ${file.name}`, error)
  // State is preserved, can retry later
})

// Add file and start upload
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', (e) => {
  const files = e.target.files
  uploader.addFiles(files)
  uploader.uploadAll()
})
```
