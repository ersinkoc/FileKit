import { Link } from 'react-router-dom'
import { Upload, Zap, Shield, Package, Code, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Package,
    title: 'Zero Dependencies',
    description: 'No external runtime dependencies. Just pure TypeScript code that works everywhere.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Optimized for performance with chunked uploads, parallel transfers, and smart retries.',
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Written in strict TypeScript with complete type definitions for your IDE.',
  },
  {
    icon: Upload,
    title: 'Drag & Drop',
    description: 'Built-in drop zone with visual feedback, file validation, and directory support.',
  },
  {
    icon: Code,
    title: 'Framework Agnostic',
    description: 'Works with vanilla JS, React, Vue, or any framework. First-class React hooks included.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Touch-friendly with responsive design patterns and mobile-optimized interactions.',
  },
]

const codeExample = `import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
})

uploader.on('progress', (file) => {
  console.log(\`\${file.name}: \${file.progress}%\`)
})

uploader.on('complete', (file) => {
  console.log(\`Uploaded: \${file.name}\`)
})

// Add files and upload
uploader.addFiles(files)
uploader.uploadAll()`

const reactExample = `import { useUploader, DropZone } from '@oxog/filekit/react'

function FileUpload() {
  const { files, addFiles, uploadAll, progress } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
  })

  return (
    <div>
      <DropZone onDrop={addFiles}>
        Drop files here or click to browse
      </DropZone>

      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.name} - {file.progress}%
          </li>
        ))}
      </ul>

      <button onClick={uploadAll}>
        Upload All ({progress.percentage}%)
      </button>
    </div>
  )
}`

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-500/30">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Modern File Uploads
              <br />
              <span className="text-violet-400">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Zero-dependency file upload toolkit with drag & drop, chunked transfers,
              progress tracking, and first-class React support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/docs/getting-started"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
              >
                Get Started
              </Link>
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {[
              { label: 'Bundle Size', value: '< 4KB' },
              { label: 'Dependencies', value: '0' },
              { label: 'TypeScript', value: '100%' },
              { label: 'Test Coverage', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Install Section */}
      <section className="py-16 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Installation</h2>
            <p className="text-zinc-400">Get started in seconds</p>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <code className="text-violet-400">npm install @oxog/filekit</code>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              A complete toolkit for handling file uploads in modern web applications.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-4">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="py-20 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple API</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Clean, intuitive APIs that work the way you expect.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vanilla JS Example */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-violet-400" />
                Vanilla JavaScript
              </h3>
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs text-zinc-500">index.js</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm">
                  <code className="text-zinc-300">{codeExample}</code>
                </pre>
              </div>
            </div>

            {/* React Example */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-violet-400" />
                React
              </h3>
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs text-zinc-500">FileUpload.tsx</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm">
                  <code className="text-zinc-300">{reactExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            Add modern file uploads to your application in minutes.
          </p>
          <Link
            to="/docs/getting-started"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors text-lg"
          >
            Read the Documentation
          </Link>
        </div>
      </section>
    </div>
  )
}
