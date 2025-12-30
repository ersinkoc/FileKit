import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { IDECodeBlock } from '../components/IDECodeBlock'
import { LivePlayground } from '../components/LivePlayground'
import { Settings, Code, Sliders } from 'lucide-react'
import clsx from 'clsx'

const configOptions = {
  maxFileSize: [
    { label: '1 MB', value: 1 },
    { label: '5 MB', value: 5 },
    { label: '10 MB', value: 10 },
    { label: '50 MB', value: 50 },
  ],
  allowedTypes: [
    { label: 'All Files', value: '*/*' },
    { label: 'Images Only', value: 'image/*' },
    { label: 'Documents', value: 'application/pdf,application/msword' },
    { label: 'Images & PDFs', value: 'image/*,application/pdf' },
  ],
  chunked: [
    { label: 'Disabled', value: false },
    { label: 'Enabled', value: true },
  ],
}

export default function Playground() {
  const { theme } = useTheme()
  const [config, setConfig] = useState({
    maxFileSize: 10,
    allowedTypes: '*/*',
    chunked: false,
    autoUpload: false,
  })

  const generatedCode = `import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: ${config.maxFileSize} * 1024 * 1024, // ${config.maxFileSize}MB
  allowedTypes: [${config.allowedTypes === '*/*' ? '' : `'${config.allowedTypes.split(',').join("', '")}'`}],
  autoUpload: ${config.autoUpload},
  chunked: ${config.chunked},${config.chunked ? `
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  parallelChunks: 3,` : ''}
})

uploader.on('progress', ({ file, percentage }) => {
  console.log(\`\${file.name}: \${percentage}%\`)
})

uploader.on('complete', (file, response) => {
  console.log('Upload complete:', file.name)
})

uploader.on('error', (file, error) => {
  console.error('Upload failed:', file.name, error)
})`

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={clsx(
            'text-4xl sm:text-5xl font-bold mb-4',
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          )}>
            Playground
          </h1>
          <p className={clsx(
            'text-lg max-w-2xl mx-auto',
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          )}>
            Experiment with FileKit configuration and see it in action.
            Customize settings and try uploading files.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Config Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                'rounded-2xl border p-6',
                theme === 'dark'
                  ? 'bg-zinc-900/50 border-zinc-800'
                  : 'bg-white border-zinc-200'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={clsx(
                  'p-2 rounded-lg',
                  theme === 'dark' ? 'bg-violet-500/10' : 'bg-violet-50'
                )}>
                  <Settings className="w-5 h-5 text-violet-500" />
                </div>
                <h2 className={clsx(
                  'text-lg font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  Configuration
                </h2>
              </div>

              <div className="space-y-6">
                {/* Max File Size */}
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                  )}>
                    Max File Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {configOptions.maxFileSize.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setConfig(c => ({ ...c, maxFileSize: option.value }))}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          config.maxFileSize === option.value
                            ? 'bg-violet-500 text-white'
                            : theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allowed Types */}
                <div>
                  <label className={clsx(
                    'block text-sm font-medium mb-2',
                    theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                  )}>
                    Allowed File Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {configOptions.allowedTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setConfig(c => ({ ...c, allowedTypes: option.value }))}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          config.allowedTypes === option.value
                            ? 'bg-violet-500 text-white'
                            : theme === 'dark'
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  {/* Chunked Upload */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.chunked}
                        onChange={(e) => setConfig(c => ({ ...c, chunked: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={clsx(
                        'w-11 h-6 rounded-full transition-colors',
                        config.chunked ? 'bg-violet-500' : theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-300'
                      )}>
                        <div className={clsx(
                          'w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5',
                          config.chunked ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                        )} />
                      </div>
                    </div>
                    <span className={clsx(
                      'text-sm font-medium',
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                    )}>
                      Chunked Upload
                    </span>
                  </label>

                  {/* Auto Upload */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.autoUpload}
                        onChange={(e) => setConfig(c => ({ ...c, autoUpload: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={clsx(
                        'w-11 h-6 rounded-full transition-colors',
                        config.autoUpload ? 'bg-violet-500' : theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-300'
                      )}>
                        <div className={clsx(
                          'w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5',
                          config.autoUpload ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                        )} />
                      </div>
                    </div>
                    <span className={clsx(
                      'text-sm font-medium',
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                    )}>
                      Auto Upload
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Generated Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-violet-500" />
                <h3 className={clsx(
                  'font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  Generated Code
                </h3>
              </div>
              <IDECodeBlock
                code={generatedCode}
                language="typescript"
                filename="uploader.ts"
                highlightLines={[4, 5, 6, 7, 8]}
              />
            </motion.div>
          </div>

          {/* Right Column - Live Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-violet-500" />
              <h3 className={clsx(
                'font-semibold',
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Live Demo
              </h3>
            </div>
            <LivePlayground />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
