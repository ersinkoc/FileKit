import CodeBlock from '../../components/CodeBlock'

export default function ChunkedUpload() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Chunked Upload</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Upload large files in chunks for better reliability and resumability.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Why Chunked Uploads?</h2>
        <p className="text-zinc-400 mb-4">
          Chunked uploads break large files into smaller pieces, providing several benefits:
        </p>
        <ul className="list-disc list-inside text-zinc-400 space-y-2">
          <li><strong>Reliability</strong> - If a chunk fails, only that chunk needs to be retried</li>
          <li><strong>Resumability</strong> - Resume interrupted uploads from where they left off</li>
          <li><strong>Progress</strong> - More accurate progress tracking for large files</li>
          <li><strong>Memory</strong> - Lower memory usage by not loading entire file at once</li>
          <li><strong>Timeouts</strong> - Avoid server timeout issues with large files</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Basic Usage</h2>
        <p className="text-zinc-400 mb-4">
          Enable chunked uploads in the uploader configuration:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  chunked: {
    enabled: true,
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
  },
})

// Large files will automatically be uploaded in chunks
uploader.addFile(largeFile) // e.g., 100MB video
await uploader.uploadAll()`}
          language="typescript"
          filename="basic.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Configuration Options</h2>
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
                <td className="py-3 px-4"><code className="text-violet-400">enabled</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Enable chunked uploads</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">chunkSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">5MB</td>
                <td className="py-3 px-4">Size of each chunk in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">parallel</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">3</td>
                <td className="py-3 px-4">Number of chunks to upload in parallel</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">retries</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">3</td>
                <td className="py-3 px-4">Retry attempts per chunk</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">minSize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">10MB</td>
                <td className="py-3 px-4">Minimum file size to use chunking</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Advanced Configuration</h2>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  chunked: {
    enabled: true,
    chunkSize: 10 * 1024 * 1024, // 10MB chunks
    parallel: 5, // Upload 5 chunks at once
    retries: 5, // Retry each chunk up to 5 times
    minSize: 20 * 1024 * 1024, // Only chunk files > 20MB
  },
})

// Files smaller than minSize will upload normally
uploader.addFile(smallFile) // < 20MB, normal upload

// Files larger than minSize will be chunked
uploader.addFile(largeFile) // > 20MB, chunked upload`}
          language="typescript"
          filename="advanced.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Chunk Events</h2>
        <p className="text-zinc-400 mb-4">
          Listen to chunk-specific events:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  chunked: { enabled: true },
})

// Chunk upload started
uploader.on('chunkStart', (file, chunkInfo) => {
  console.log(\`Starting chunk \${chunkInfo.index + 1}/\${chunkInfo.total}\`)
  console.log(\`Chunk size: \${chunkInfo.size} bytes\`)
})

// Chunk upload progress
uploader.on('chunkProgress', (file, chunkInfo, progress) => {
  console.log(\`Chunk \${chunkInfo.index + 1}: \${progress}%\`)
})

// Chunk upload completed
uploader.on('chunkComplete', (file, chunkInfo, response) => {
  console.log(\`Chunk \${chunkInfo.index + 1} complete\`)
  console.log(\`Response:\`, response)
})

// Chunk upload failed
uploader.on('chunkError', (file, chunkInfo, error) => {
  console.error(\`Chunk \${chunkInfo.index + 1} failed:\`, error.message)
})

// Chunk retry
uploader.on('chunkRetry', (file, chunkInfo, attempt) => {
  console.log(\`Retrying chunk \${chunkInfo.index + 1}, attempt \${attempt}\`)
})`}
          language="typescript"
          filename="events.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Chunk Info Object</h2>
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
                <td className="py-3 px-4"><code className="text-violet-400">index</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Zero-based chunk index</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">total</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Total number of chunks</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">start</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Start byte position in file</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">end</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">End byte position in file</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">size</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Size of this chunk in bytes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">blob</code></td>
                <td className="py-3 px-4">Blob</td>
                <td className="py-3 px-4">The chunk data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Server-Side Implementation</h2>
        <p className="text-zinc-400 mb-4">
          Your server needs to handle chunked uploads. FileKit sends these headers with each chunk:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Header</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">X-Chunk-Index</code></td>
                <td className="py-3 px-4">Current chunk index (0-based)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">X-Chunk-Total</code></td>
                <td className="py-3 px-4">Total number of chunks</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">X-File-Id</code></td>
                <td className="py-3 px-4">Unique file identifier for assembly</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">X-File-Name</code></td>
                <td className="py-3 px-4">Original file name</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">X-File-Size</code></td>
                <td className="py-3 px-4">Total file size in bytes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-zinc-400 mb-4">
          Example Node.js server implementation:
        </p>
        <CodeBlock
          code={`// Express.js example
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

const app = express()
const upload = multer({ dest: 'temp/' })

// Store chunk status in memory (use Redis in production)
const uploadStatus = new Map()

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const chunkIndex = parseInt(req.headers['x-chunk-index'])
  const chunkTotal = parseInt(req.headers['x-chunk-total'])
  const fileId = req.headers['x-file-id']
  const fileName = req.headers['x-file-name']
  const fileSize = parseInt(req.headers['x-file-size'])

  // Check if this is a chunked upload
  if (chunkIndex !== undefined && chunkTotal > 1) {
    // Initialize status for new uploads
    if (!uploadStatus.has(fileId)) {
      uploadStatus.set(fileId, {
        fileName,
        fileSize,
        totalChunks: chunkTotal,
        receivedChunks: new Set(),
        tempDir: path.join('temp', fileId),
      })
      fs.mkdirSync(path.join('temp', fileId), { recursive: true })
    }

    const status = uploadStatus.get(fileId)

    // Save chunk to temp directory
    const chunkPath = path.join(status.tempDir, \`chunk-\${chunkIndex}\`)
    fs.renameSync(req.file.path, chunkPath)
    status.receivedChunks.add(chunkIndex)

    // Check if all chunks received
    if (status.receivedChunks.size === chunkTotal) {
      // Assemble chunks
      const finalPath = path.join('uploads', fileName)
      const writeStream = fs.createWriteStream(finalPath)

      for (let i = 0; i < chunkTotal; i++) {
        const chunkPath = path.join(status.tempDir, \`chunk-\${i}\`)
        const chunkData = fs.readFileSync(chunkPath)
        writeStream.write(chunkData)
        fs.unlinkSync(chunkPath)
      }

      writeStream.end()
      fs.rmdirSync(status.tempDir)
      uploadStatus.delete(fileId)

      return res.json({
        success: true,
        complete: true,
        path: finalPath,
      })
    }

    return res.json({
      success: true,
      complete: false,
      received: status.receivedChunks.size,
      total: chunkTotal,
    })
  }

  // Non-chunked upload
  const finalPath = path.join('uploads', req.file.originalname)
  fs.renameSync(req.file.path, finalPath)

  res.json({
    success: true,
    path: finalPath,
  })
})`}
          language="typescript"
          filename="server.ts"
          showLineNumbers
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Resumable Uploads</h2>
        <p className="text-zinc-400 mb-4">
          Implement resumable uploads by tracking completed chunks:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  chunked: {
    enabled: true,
    chunkSize: 5 * 1024 * 1024,
  },
  // Custom endpoint to check upload status
  resumeEndpoint: '/api/upload/status',
})

// Before uploading, check for existing progress
uploader.on('beforeUpload', async (file) => {
  const response = await fetch(\`/api/upload/status?fileId=\${file.id}\`)
  const status = await response.json()

  if (status.exists) {
    // Set completed chunks to skip them
    file.completedChunks = status.completedChunks
    console.log(\`Resuming from chunk \${status.completedChunks.length}\`)
  }
})

// Track completed chunks locally for resume
const completedChunks = new Map()

uploader.on('chunkComplete', (file, chunkInfo) => {
  if (!completedChunks.has(file.id)) {
    completedChunks.set(file.id, [])
  }
  completedChunks.get(file.id).push(chunkInfo.index)

  // Persist to localStorage for page refresh resume
  localStorage.setItem(
    \`upload_progress_\${file.id}\`,
    JSON.stringify(completedChunks.get(file.id))
  )
})

uploader.on('complete', (file) => {
  // Clean up stored progress
  localStorage.removeItem(\`upload_progress_\${file.id}\`)
  completedChunks.delete(file.id)
})`}
          language="typescript"
          filename="resumable.ts"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Best Practices</h2>
        <ul className="list-disc list-inside text-zinc-400 space-y-2">
          <li><strong>Chunk Size</strong> - Use 5-10MB chunks. Smaller chunks mean more requests, larger chunks mean longer retry times.</li>
          <li><strong>Parallel Uploads</strong> - 3-5 parallel chunks is usually optimal. More can overwhelm the server.</li>
          <li><strong>Retries</strong> - Always enable retries for chunked uploads. Network issues are more likely with large files.</li>
          <li><strong>Server Timeout</strong> - Ensure your server timeout is longer than chunk upload time.</li>
          <li><strong>File ID</strong> - Use a consistent file ID (e.g., hash of file content) for resumability.</li>
          <li><strong>Cleanup</strong> - Implement server-side cleanup for incomplete uploads older than 24 hours.</li>
        </ul>
      </section>
    </div>
  )
}
