# File Validation

FileKit provides comprehensive file validation to ensure only valid files are uploaded.

## Built-in Validators

### File Size

```typescript
const uploader = createUploader({
  endpoint: '/api/upload',
  maxFileSize: 10 * 1024 * 1024,  // 10MB max
  minFileSize: 1024,              // 1KB min
})
```

### File Type

```typescript
const uploader = createUploader({
  endpoint: '/api/upload',
  allowedTypes: ['image/*', 'application/pdf'],  // Allow images and PDFs
  blockedTypes: ['image/svg+xml'],               // But not SVGs
})
```

#### MIME Type Patterns

- Exact match: `'image/png'`, `'application/pdf'`
- Wildcards: `'image/*'`, `'video/*'`, `'audio/*'`
- Multiple types: `['image/png', 'image/jpeg', 'application/pdf']`

### File Count

```typescript
const uploader = createUploader({
  endpoint: '/api/upload',
  maxFiles: 5,        // Maximum 5 files
  multiple: true,     // Allow multiple files
})
```

### Image Dimensions

```typescript
const uploader = createUploader({
  endpoint: '/api/upload',
  allowedTypes: ['image/*'],
  imageDimensions: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 4000,
    maxHeight: 4000,
  },
})
```

## Custom Validators

Create custom validators for any validation logic:

```typescript
import { createUploader, createValidator } from '@anthropic/filekit'

// Simple validator
const noSpecialChars = createValidator(
  'no-special-chars',
  (file) => {
    if (/[^a-zA-Z0-9._-]/.test(file.name)) {
      throw new Error('Filename contains special characters')
    }
  }
)

// Async validator
const virusScan = createValidator(
  'virus-scan',
  async (file) => {
    const result = await scanFile(file)
    if (!result.clean) {
      throw new Error('File failed virus scan')
    }
  }
)

// Validator with access to existing files
const noDuplicates = createValidator(
  'no-duplicates',
  (file, existingFiles) => {
    const duplicate = existingFiles.find(f => f.name === file.name)
    if (duplicate) {
      throw new Error('File already added')
    }
  }
)

const uploader = createUploader({
  endpoint: '/api/upload',
  validators: [noSpecialChars, virusScan, noDuplicates],
})
```

## Error Handling

Validation errors are thrown when adding files:

```typescript
try {
  uploader.addFile(file)
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    alert('File is too large. Maximum size is 10MB.')
  } else if (error.code === 'INVALID_TYPE') {
    alert('File type not allowed.')
  } else if (error.code === 'MAX_FILES_EXCEEDED') {
    alert('Too many files. Maximum is 5.')
  } else if (error.code === 'VALIDATION_FAILED') {
    alert(error.message)
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `FILE_TOO_LARGE` | File exceeds `maxFileSize` |
| `FILE_TOO_SMALL` | File is below `minFileSize` |
| `INVALID_TYPE` | File type not in `allowedTypes` or is in `blockedTypes` |
| `MAX_FILES_EXCEEDED` | Adding file would exceed `maxFiles` |
| `INVALID_DIMENSIONS` | Image dimensions outside allowed range |
| `VALIDATION_FAILED` | Custom validator failed |

## Validation in Drop Zones

Drop zones show validation state during drag:

```typescript
const dropZone = createDropZone(element, {
  endpoint: '/api/upload',
  allowedTypes: ['image/*'],
  maxFileSize: 5 * 1024 * 1024,

  // CSS classes for validation states
  acceptClass: 'drop-accept',  // Valid files being dragged
  rejectClass: 'drop-reject',  // Invalid files being dragged
})
```

```css
.drop-accept {
  border-color: green;
  background: #f0fff4;
}

.drop-reject {
  border-color: red;
  background: #fff0f0;
}
```

## React Validation

```tsx
import { DropZone } from '@anthropic/filekit/react'

function ValidatedUpload() {
  return (
    <DropZone
      endpoint="/api/upload"
      maxFileSize={10 * 1024 * 1024}
      allowedTypes={['image/*']}
      maxFiles={3}
      onUploadError={(file, error) => {
        // Handle validation errors
        toast.error(error.message)
      }}
    >
      {({ isDragReject }) => (
        <div>
          {isDragReject ? (
            <p style={{ color: 'red' }}>Invalid file type</p>
          ) : (
            <p>Drop images here (max 10MB, max 3 files)</p>
          )}
        </div>
      )}
    </DropZone>
  )
}
```

## Validation Examples

### Profile Picture

```typescript
const profileUploader = createUploader({
  endpoint: '/api/avatar',
  maxFileSize: 2 * 1024 * 1024,  // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 1,
  multiple: false,
  imageDimensions: {
    minWidth: 200,
    minHeight: 200,
    maxWidth: 2000,
    maxHeight: 2000,
  },
})
```

### Document Upload

```typescript
const docUploader = createUploader({
  endpoint: '/api/documents',
  maxFileSize: 25 * 1024 * 1024,  // 25MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  maxFiles: 10,
})
```

### Secure File Upload

```typescript
const secureUploader = createUploader({
  endpoint: '/api/secure-upload',
  allowedTypes: ['image/*', 'application/pdf'],
  blockedTypes: [
    'image/svg+xml',           // Block SVGs (can contain scripts)
    'application/javascript',  // Block JS files
    'text/html',               // Block HTML
  ],
  validators: [
    createValidator('file-signature', async (file) => {
      // Verify file signature matches extension
      const buffer = await file.slice(0, 4).arrayBuffer()
      const signature = new Uint8Array(buffer)

      const isValidPng = signature[0] === 0x89 && signature[1] === 0x50
      const isValidJpeg = signature[0] === 0xFF && signature[1] === 0xD8
      const isValidPdf = signature[0] === 0x25 && signature[1] === 0x50

      if (!isValidPng && !isValidJpeg && !isValidPdf) {
        throw new Error('File signature does not match file type')
      }
    }),
  ],
})
```

## Best Practices

1. **Validate on client and server**: Client-side validation improves UX, but always validate on the server too.

2. **Show clear error messages**: Tell users exactly what's wrong and how to fix it.

3. **Validate early**: Check files as soon as they're selected, not when upload starts.

4. **Use allowedTypes**: It's safer to allow specific types than to block specific types.

5. **Consider file signatures**: MIME types can be spoofed; check file signatures for security-critical uploads.

6. **Set reasonable limits**: Balance user needs with server resources.
