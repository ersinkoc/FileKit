import { Link } from 'react-router-dom'
import { Upload, Zap, Shield, Package, Code, ChevronRight, Play, ArrowRight, Layers, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { IDECodeBlock } from '../components/IDECodeBlock'
import { LivePlayground } from '../components/LivePlayground'
import clsx from 'clsx'

const features = [
  {
    icon: Package,
    title: 'Zero Dependencies',
    description: 'No external runtime dependencies. Pure TypeScript that works everywhere.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Chunked uploads, parallel transfers, and smart retry mechanisms.',
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Written in strict TypeScript with complete type definitions.',
  },
  {
    icon: Upload,
    title: 'Drag & Drop',
    description: 'Built-in drop zone with visual feedback and file validation.',
  },
  {
    icon: Layers,
    title: 'Chunked Uploads',
    description: 'Split large files into chunks with pause, resume, and retry.',
  },
  {
    icon: RefreshCw,
    title: 'Auto Retry',
    description: 'Automatic retry with exponential backoff on failures.',
  },
]

const vanillaCode = `import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*', 'application/pdf'],
  chunked: true,
  chunkSize: 5 * 1024 * 1024,
})

uploader.on('progress', ({ file, percentage }) => {
  console.log(\`\${file.name}: \${percentage}%\`)
})

uploader.on('complete', (file, response) => {
  console.log('Uploaded:', file.name)
})

// Add files and upload
uploader.addFiles(files)
uploader.uploadAll()`

const reactCode = `import { DropZone, useUploader } from '@oxog/filekit/react'

function FileUpload() {
  const { files, uploadAll, progress } = useUploader({
    endpoint: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,
  })

  return (
    <div>
      <DropZone
        className="border-2 border-dashed p-8"
        activeClassName="border-violet-500 bg-violet-50"
      >
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
        Upload ({progress.percentage}%)
      </button>
    </div>
  )
}`

const dropzoneCode = `import { createDropZone } from '@oxog/filekit'

const dropZone = createDropZone(element, {
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,
  allowedTypes: ['image/*'],
  autoUpload: true,

  // CSS classes for drag states
  activeClass: 'drag-active',
  acceptClass: 'drag-accept',
  rejectClass: 'drag-reject',
})

dropZone.uploader.on('complete', (file) => {
  console.log('Uploaded:', file.name)
})`

export default function Home() {
  const { theme } = useTheme()

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={clsx(
            'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl opacity-20',
            theme === 'dark' ? 'bg-violet-500' : 'bg-violet-300'
          )} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{
                background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className={clsx(
                'text-sm font-medium',
                theme === 'dark' ? 'text-violet-300' : 'text-violet-600'
              )}>
                v1.0 just released
              </span>
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-violet-500/30">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur opacity-30" />
              </div>
            </motion.div>

            {/* Headline */}
            <h1 className={clsx(
              'text-5xl sm:text-7xl font-bold tracking-tight mb-6',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Modern File Uploads
              <br />
              <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className={clsx(
              'text-xl max-w-2xl mx-auto mb-10',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Zero-dependency file upload toolkit with drag & drop, chunked transfers,
              progress tracking, and first-class React support.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/docs/getting-started"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/playground"
                className={clsx(
                  'group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all border',
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                    : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50'
                )}
              >
                <Play className="w-5 h-5" />
                Try Playground
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: 'Bundle Size', value: '< 4KB', sublabel: 'gzipped' },
                { label: 'Dependencies', value: '0', sublabel: 'zero runtime' },
                { label: 'TypeScript', value: '100%', sublabel: 'type coverage' },
                { label: 'Test Coverage', value: '95%+', sublabel: '379 tests' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className={clsx(
                    'text-3xl sm:text-4xl font-bold',
                    theme === 'dark' ? 'text-white' : 'text-zinc-900'
                  )}>
                    {stat.value}
                  </div>
                  <div className={clsx(
                    'text-sm font-medium',
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                  )}>
                    {stat.label}
                  </div>
                  <div className={clsx(
                    'text-xs',
                    theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                  )}>
                    {stat.sublabel}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Install Section */}
      <section className={clsx(
        'py-16 border-y',
        theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <IDECodeBlock
              code="npm install @oxog/filekit"
              language="bash"
              filename="Terminal"
              showLineNumbers={false}
              variant="terminal"
            />
          </div>
        </div>
      </section>

      {/* Live Playground Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={clsx(
              'text-3xl sm:text-4xl font-bold mb-4',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Try It Now
            </h2>
            <p className={clsx(
              'text-lg max-w-2xl mx-auto',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Experience FileKit right in your browser. Drag files, see progress, and watch the magic happen.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <LivePlayground />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={clsx(
        'py-24 border-t',
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={clsx(
              'text-3xl sm:text-4xl font-bold mb-4',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Everything You Need
            </h2>
            <p className={clsx(
              'text-lg max-w-2xl mx-auto',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              A complete toolkit for handling file uploads in modern web applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={clsx(
                  'p-6 rounded-2xl border transition-all hover:scale-[1.02]',
                  theme === 'dark'
                    ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
                )}
              >
                <div className={clsx(
                  'flex h-12 w-12 items-center justify-center rounded-xl mb-4',
                  theme === 'dark' ? 'bg-violet-500/10' : 'bg-violet-50'
                )}>
                  <feature.icon className="h-6 w-6 text-violet-500" />
                </div>
                <h3 className={clsx(
                  'text-lg font-semibold mb-2',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  {feature.title}
                </h3>
                <p className={clsx(
                  'text-sm',
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                )}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className={clsx(
        'py-24 border-t',
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={clsx(
              'text-3xl sm:text-4xl font-bold mb-4',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Beautiful API
            </h2>
            <p className={clsx(
              'text-lg max-w-2xl mx-auto',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Clean, intuitive APIs that work the way you expect. Works with vanilla JS or React.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vanilla JS */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-yellow-500" />
                <h3 className={clsx(
                  'font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  Vanilla JavaScript
                </h3>
              </div>
              <IDECodeBlock
                code={vanillaCode}
                language="typescript"
                filename="upload.ts"
                highlightLines={[3, 4, 5, 6, 7]}
              />
            </div>

            {/* React */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-cyan-500" />
                <h3 className={clsx(
                  'font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  React
                </h3>
              </div>
              <IDECodeBlock
                code={reactCode}
                language="tsx"
                filename="FileUpload.tsx"
                highlightLines={[3, 4, 5]}
              />
            </div>
          </div>

          {/* Drop Zone Example */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-violet-500" />
              <h3 className={clsx(
                'font-semibold',
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Drop Zone
              </h3>
            </div>
            <IDECodeBlock
              code={dropzoneCode}
              language="typescript"
              filename="dropzone.ts"
              highlightLines={[5, 6, 7, 8, 9, 10, 11]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={clsx(
        'py-24 border-t',
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className={clsx(
            'max-w-3xl mx-auto p-12 rounded-3xl border',
            theme === 'dark'
              ? 'bg-gradient-to-b from-zinc-900 to-zinc-900/50 border-zinc-800'
              : 'bg-gradient-to-b from-white to-zinc-50 border-zinc-200'
          )}>
            <h2 className={clsx(
              'text-3xl sm:text-4xl font-bold mb-4',
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Ready to Get Started?
            </h2>
            <p className={clsx(
              'text-lg mb-8 max-w-xl mx-auto',
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Add modern file uploads to your application in minutes. Free, open source, and MIT licensed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/docs/getting-started"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition-all"
              >
                Read the Docs
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all border',
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                    : 'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
                )}
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
