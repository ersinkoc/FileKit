import CodeBlock from '../../components/CodeBlock'

export default function Validation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-4">Validation</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Validate files before upload with built-in and custom validators.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Built-in Validation</h2>
        <p className="text-zinc-400 mb-4">
          The uploader includes built-in validation for file size and type:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
})

// Files that don't match will throw an error when added
try {
  uploader.addFile(largeFile) // Throws if > 10MB
} catch (error) {
  console.error(error.message) // "File too large"
  console.error(error.code) // "FILE_TOO_LARGE"
}`}
          language="typescript"
          filename="built-in.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Creating a Validator</h2>
        <p className="text-zinc-400 mb-4">
          Use <code className="text-violet-400">createValidator</code> to create a standalone validator:
        </p>
        <CodeBlock
          code={`import { createValidator } from '@oxog/filekit'

const validator = createValidator({
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minFileSize: 1024, // 1KB minimum
})

// Validate a file
const result = validator.validate(file)

if (result.valid) {
  console.log('File is valid!')
} else {
  console.error('Validation errors:', result.errors)
  // errors is an array of { code, message, details }
}

// Validate multiple files
const results = validator.validateAll(files)
const validFiles = results.filter(r => r.valid).map(r => r.file)
const invalidFiles = results.filter(r => !r.valid)`}
          language="typescript"
          filename="validator.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Custom Validators</h2>
        <p className="text-zinc-400 mb-4">
          Add custom validation rules:
        </p>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  validators: [
    // Custom validator to check file name
    {
      name: 'noSpaces',
      validate: (file) => {
        if (file.name.includes(' ')) {
          throw new Error('File name cannot contain spaces')
        }
      },
    },

    // Async validator (e.g., check with server)
    {
      name: 'checkDuplicate',
      validate: async (file) => {
        const exists = await checkFileExists(file.name)
        if (exists) {
          throw new Error('File already exists on server')
        }
      },
    },

    // Validator with detailed error
    {
      name: 'maxNameLength',
      validate: (file) => {
        if (file.name.length > 50) {
          const error = new Error('File name too long')
          error.code = 'NAME_TOO_LONG'
          error.details = { maxLength: 50, actualLength: file.name.length }
          throw error
        }
      },
    },
  ],
})`}
          language="typescript"
          filename="custom.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Built-in Validator Functions</h2>
        <p className="text-zinc-400 mb-4">
          FileKit provides common validator functions:
        </p>
        <CodeBlock
          code={`import {
  createValidator,
  validators,
} from '@oxog/filekit'

const validator = createValidator({
  validators: [
    // Check file name doesn't contain special characters
    validators.fileName({
      pattern: /^[a-zA-Z0-9._-]+$/,
      message: 'Invalid file name characters',
    }),

    // Check file extension
    validators.extension({
      allowed: ['jpg', 'png', 'gif'],
      message: 'Only JPG, PNG, and GIF files are allowed',
    }),

    // Check image dimensions (for image files)
    validators.imageDimensions({
      minWidth: 100,
      minHeight: 100,
      maxWidth: 4000,
      maxHeight: 4000,
    }),

    // Check aspect ratio
    validators.aspectRatio({
      ratio: 16 / 9,
      tolerance: 0.1, // 10% tolerance
    }),

    // Prevent duplicate files
    validators.noDuplicates({
      files: existingFiles,
      checkBy: 'name', // or 'size' or 'both'
    }),
  ],
})`}
          language="typescript"
          filename="built-in-validators.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Image Validation</h2>
        <p className="text-zinc-400 mb-4">
          Special validation for image files:
        </p>
        <CodeBlock
          code={`import { createValidator, validators } from '@oxog/filekit'

const imageValidator = createValidator({
  allowedTypes: ['image/*'],
  maxFileSize: 5 * 1024 * 1024,
  validators: [
    // Minimum dimensions
    validators.imageDimensions({
      minWidth: 200,
      minHeight: 200,
      message: 'Image must be at least 200x200 pixels',
    }),

    // Maximum dimensions
    validators.imageDimensions({
      maxWidth: 4096,
      maxHeight: 4096,
      message: 'Image cannot exceed 4096x4096 pixels',
    }),

    // Exact dimensions
    validators.imageDimensions({
      width: 1920,
      height: 1080,
      message: 'Image must be exactly 1920x1080',
    }),

    // Square images only
    validators.aspectRatio({
      ratio: 1,
      tolerance: 0,
      message: 'Only square images are allowed',
    }),

    // Custom image validation
    {
      name: 'customImage',
      validate: async (file) => {
        const img = await loadImage(file)
        if (img.width < img.height) {
          throw new Error('Image must be landscape orientation')
        }
      },
    },
  ],
})`}
          language="typescript"
          filename="image-validation.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Error Handling</h2>
        <p className="text-zinc-400 mb-4">
          Handle validation errors gracefully:
        </p>
        <CodeBlock
          code={`import { createUploader, FileKitError } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
})

// Handle validation errors when adding files
function addFiles(files) {
  const added = []
  const rejected = []

  for (const file of files) {
    try {
      const item = uploader.addFile(file)
      added.push(item)
    } catch (error) {
      if (error instanceof FileKitError) {
        rejected.push({
          file,
          code: error.code,
          message: error.message,
          details: error.details,
        })
      }
    }
  }

  if (rejected.length > 0) {
    showValidationErrors(rejected)
  }

  return added
}

// Display errors to user
function showValidationErrors(errors) {
  errors.forEach(({ file, code, message }) => {
    switch (code) {
      case 'FILE_TOO_LARGE':
        console.error(\`\${file.name} is too large\`)
        break
      case 'INVALID_TYPE':
        console.error(\`\${file.name} has an invalid type\`)
        break
      default:
        console.error(\`\${file.name}: \${message}\`)
    }
  })
}`}
          language="typescript"
          filename="error-handling.ts"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Validation Events</h2>
        <CodeBlock
          code={`import { createUploader } from '@oxog/filekit'

const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 5 * 1024 * 1024,
})

// Listen for validation events
uploader.on('validationError', (file, errors) => {
  console.error('Validation failed for:', file.name)
  errors.forEach(error => {
    console.error(\`  - \${error.code}: \${error.message}\`)
  })
})

// The 'error' event is also emitted for validation errors
uploader.on('error', (file, error) => {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Validation error:', error.message)
  }
})`}
          language="typescript"
          filename="events.ts"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-zinc-300 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">FILE_TOO_LARGE</code></td>
                <td className="py-3 px-4">File exceeds maximum size limit</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">FILE_TOO_SMALL</code></td>
                <td className="py-3 px-4">File is below minimum size limit</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_TYPE</code></td>
                <td className="py-3 px-4">File type not in allowed types</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">MAX_FILES_EXCEEDED</code></td>
                <td className="py-3 px-4">Maximum number of files reached</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_DIMENSIONS</code></td>
                <td className="py-3 px-4">Image dimensions don't meet requirements</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_ASPECT_RATIO</code></td>
                <td className="py-3 px-4">Image aspect ratio doesn't match</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">DUPLICATE_FILE</code></td>
                <td className="py-3 px-4">File already exists in queue</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_EXTENSION</code></td>
                <td className="py-3 px-4">File extension not allowed</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">INVALID_FILE_NAME</code></td>
                <td className="py-3 px-4">File name doesn't match pattern</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><code className="text-violet-400">VALIDATION_ERROR</code></td>
                <td className="py-3 px-4">Custom validation failed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
