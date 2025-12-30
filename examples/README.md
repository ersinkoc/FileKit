# FileKit Examples

This folder contains examples demonstrating how to use FileKit.

## Examples

### basic-upload.html

Basic file upload with drag & drop support. Demonstrates:
- Creating a drop zone
- File validation (size, type)
- Upload progress tracking
- Event handling

### chunked-upload.html

Large file upload with chunked upload support. Demonstrates:
- Chunked uploads for large files
- Pause/resume functionality
- Retry failed uploads
- Progress tracking per chunk

### react-example/

React integration examples. Demonstrates:
- Using the `DropZone` component with render props
- Using the `useUploader` hook for custom UI
- File list management
- Upload controls (pause, resume, cancel, retry)

## Running the Examples

1. Build the library first:
   ```bash
   npm run build
   ```

2. Serve the examples with a local server:
   ```bash
   npx serve .
   ```

3. Open your browser to the example you want to try.

Note: The examples require a server endpoint at `/api/upload`. You can use a mock server or modify the endpoint to match your backend.
