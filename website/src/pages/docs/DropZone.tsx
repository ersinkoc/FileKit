import CodeBlock from '../../components/CodeBlock'

export default function DropZonePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Drop Zone</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Add drag and drop file uploads to your application.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Creating a Drop Zone</h2>
        <p className="text-zinc-400 mb-4">
          Use <code className="text-violet-400">createDropZone</code> to create a drop zone:
        </p>
        <CodeBlock
          code={`import { createDropZone } from '@oxog/filekit'

const dropzone = createDropZone(document.getElementById('drop-area'), {
  accept: ['image/*', 'application/pdf'],
  multiple: true,
  maxFiles: 10,
})

// Listen for dropped files
dropzone.on('drop', (files) => {
  console.log('Dropped files:', files)
})

// Listen for drag state changes
dropzone.on('dragenter', () => {
  console.log('Drag entered')
})

dropzone.on('dragleave', () => {
  console.log('Drag left')
})`}
          language="typescript"
          filename="dropzone.ts"
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
                <td className="py-3 px-4"><code className="text-violet-400">accept</code></td>
                <td className="py-3 px-4">string[]</td>
                <td className="py-3 px-4">['*/*']</td>
                <td className="py-3 px-4">Accepted MIME types</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">multiple</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">true</td>
                <td className="py-3 px-4">Allow multiple file selection</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">maxFiles</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">Infinity</td>
                <td className="py-3 px-4">Maximum number of files</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">disabled</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Disable the drop zone</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">clickable</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">true</td>
                <td className="py-3 px-4">Open file dialog on click</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">noKeyboard</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Disable keyboard interactions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Events</h2>
        <CodeBlock
          code={`// Files dropped or selected
dropzone.on('drop', (files) => {
  console.log('Files:', files)
})

// Drag entered the zone
dropzone.on('dragenter', () => {
  dropElement.classList.add('drag-active')
})

// Drag left the zone
dropzone.on('dragleave', () => {
  dropElement.classList.remove('drag-active')
})

// Drag over the zone (continuous)
dropzone.on('dragover', (event) => {
  // Access the original drag event if needed
  console.log('Dragging over...')
})

// Error occurred
dropzone.on('error', (error) => {
  console.error('Drop zone error:', error.message)
})`}
          language="typescript"
          filename="events.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Visual Feedback</h2>
        <p className="text-zinc-400 mb-4">
          Add visual feedback when files are being dragged:
        </p>
        <CodeBlock
          code={`const dropzone = createDropZone(element)

// Track drag state
let isDragActive = false

dropzone.on('dragenter', () => {
  isDragActive = true
  element.classList.add('border-violet-500', 'bg-violet-500/10')
  element.textContent = 'Drop files here!'
})

dropzone.on('dragleave', () => {
  isDragActive = false
  element.classList.remove('border-violet-500', 'bg-violet-500/10')
  element.textContent = 'Drag files here or click to browse'
})

dropzone.on('drop', () => {
  isDragActive = false
  element.classList.remove('border-violet-500', 'bg-violet-500/10')
  element.textContent = 'Drag files here or click to browse'
})`}
          language="typescript"
          filename="visual-feedback.ts"
        />

        <p className="text-zinc-400 mt-4 mb-4">
          Example CSS for the drop zone:
        </p>
        <CodeBlock
          code={`.drop-zone {
  border: 2px dashed #3f3f46;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #71717a;
}

.drop-zone.drag-active {
  border-color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.1);
}

.drop-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`}
          language="css"
          filename="dropzone.css"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Integration with Uploader</h2>
        <p className="text-zinc-400 mb-4">
          Connect the drop zone to an uploader:
        </p>
        <CodeBlock
          code={`import { createUploader, createDropZone } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
})

const dropzone = createDropZone(element, {
  accept: ['image/*'],
})

// Add dropped files to the uploader
dropzone.on('drop', (files) => {
  uploader.addFiles(files)
})

// Handle upload events
uploader.on('complete', (file) => {
  console.log('Uploaded:', file.name)
})

// Upload all files when button is clicked
document.getElementById('upload-btn').onclick = () => {
  uploader.uploadAll()
}`}
          language="typescript"
          filename="integration.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Methods</h2>
        <CodeBlock
          code={`// Enable/disable the drop zone
dropzone.enable()
dropzone.disable()

// Check if drag is active
const isDragActive = dropzone.isDragActive()

// Open file dialog programmatically
dropzone.open()

// Get current configuration
const config = dropzone.getConfig()

// Update configuration
dropzone.setConfig({ maxFiles: 5 })

// Destroy the drop zone (cleanup)
dropzone.destroy()`}
          language="typescript"
          filename="methods.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Accessibility</h2>
        <p className="text-zinc-400 mb-4">
          The drop zone is accessible by default with keyboard support:
        </p>
        <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
          <li><kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">Tab</kbd> - Focus the drop zone</li>
          <li><kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">Enter</kbd> or <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">Space</kbd> - Open file dialog</li>
        </ul>
        <p className="text-zinc-400 mb-4">
          Add proper ARIA attributes for better accessibility:
        </p>
        <CodeBlock
          code={`<div
  id="drop-zone"
  role="button"
  tabindex="0"
  aria-label="File upload area. Drag and drop files here or press Enter to browse."
>
  <p>Drag files here or click to browse</p>
</div>

<script>
  const dropzone = createDropZone(document.getElementById('drop-zone'), {
    noKeyboard: false, // Enable keyboard interaction
  })
</script>`}
          language="html"
          filename="accessibility.html"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Complete Example</h2>
        <CodeBlock
          code={`import { createUploader, createDropZone } from '@oxog/filekit'

// HTML structure
const html = \`
  <div id="drop-zone" class="drop-zone">
    <p id="drop-message">Drag files here or click to browse</p>
  </div>
  <ul id="file-list"></ul>
  <button id="upload-btn">Upload All</button>
\`

// Create uploader and drop zone
const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
})

const dropElement = document.getElementById('drop-zone')
const messageElement = document.getElementById('drop-message')
const fileListElement = document.getElementById('file-list')
const uploadButton = document.getElementById('upload-btn')

const dropzone = createDropZone(dropElement, {
  accept: ['image/*', 'application/pdf'],
  multiple: true,
})

// Visual feedback
dropzone.on('dragenter', () => {
  dropElement.classList.add('drag-active')
  messageElement.textContent = 'Drop files here!'
})

dropzone.on('dragleave', () => {
  dropElement.classList.remove('drag-active')
  messageElement.textContent = 'Drag files here or click to browse'
})

// Handle dropped files
dropzone.on('drop', (files) => {
  dropElement.classList.remove('drag-active')
  messageElement.textContent = 'Drag files here or click to browse'

  files.forEach(file => {
    const item = uploader.addFile(file)
    const li = document.createElement('li')
    li.id = \`file-\${item.id}\`
    li.textContent = \`\${item.name} - Pending\`
    fileListElement.appendChild(li)
  })
})

// Update file list on progress
uploader.on('progress', (file) => {
  const li = document.getElementById(\`file-\${file.id}\`)
  if (li) li.textContent = \`\${file.name} - \${file.progress}%\`
})

uploader.on('complete', (file) => {
  const li = document.getElementById(\`file-\${file.id}\`)
  if (li) li.textContent = \`\${file.name} - Complete!\`
})

uploader.on('error', (file, error) => {
  const li = document.getElementById(\`file-\${file.id}\`)
  if (li) li.textContent = \`\${file.name} - Error: \${error.message}\`
})

// Upload button
uploadButton.onclick = () => uploader.uploadAll()`}
          language="typescript"
          filename="complete-example.ts"
          showLineNumbers
        />
      </section>
    </div>
  )
}
