# FileKit - Task List

## Phase 1: Project Setup

### Task 1.1: Initialize Project
- [x] Create package.json with correct metadata
- [x] Create tsconfig.json with strict mode
- [x] Create tsup.config.ts for building
- [x] Create vitest.config.ts for testing
- [x] Create .gitignore
- [x] Create LICENSE (MIT)

### Task 1.2: Create Directory Structure
- [x] Create src/ directory
- [x] Create src/core/
- [x] Create src/upload/
- [x] Create src/validation/
- [x] Create src/preview/
- [x] Create src/utils/
- [x] Create src/adapters/react/
- [x] Create tests/

## Phase 2: Core Types and Utilities

### Task 2.1: Type Definitions
- [ ] Create src/types.ts with all interfaces
- [ ] Create src/errors.ts with error classes

### Task 2.2: Utility Functions
- [ ] Create src/utils/id.ts (ID generation)
- [ ] Create src/utils/file.ts (file type checks)
- [ ] Create src/utils/mime.ts (MIME mapping)
- [ ] Create src/utils/size.ts (size formatting)
- [ ] Create src/utils/reader.ts (file reading)
- [ ] Create src/utils/index.ts (exports)

## Phase 3: Validation Module

### Task 3.1: Core Validation
- [ ] Create src/validation/size.ts
- [ ] Create src/validation/type.ts
- [ ] Create src/validation/image.ts

### Task 3.2: Validator System
- [ ] Create src/validation/validator.ts
- [ ] Create src/validation/validators.ts (built-in)
- [ ] Create src/validation/index.ts

## Phase 4: Preview Module

### Task 4.1: Image Processing
- [ ] Create src/preview/dimensions.ts
- [ ] Create src/preview/image-preview.ts
- [ ] Create src/preview/compress.ts
- [ ] Create src/preview/index.ts

## Phase 5: Upload Module

### Task 5.1: XHR Upload
- [ ] Create src/upload/progress.ts
- [ ] Create src/upload/xhr.ts
- [ ] Create src/upload/retry.ts

### Task 5.2: Chunked Upload
- [ ] Create src/upload/chunked.ts
- [ ] Create src/upload/index.ts

## Phase 6: Core Classes

### Task 6.1: Configuration
- [ ] Create src/core/config.ts
- [ ] Create src/core/events.ts

### Task 6.2: FileItem
- [ ] Create src/core/file-item.ts

### Task 6.3: Uploader
- [ ] Create src/core/uploader.ts

### Task 6.4: DropZone
- [ ] Create src/core/drop-zone.ts

### Task 6.5: Queue
- [ ] Create src/core/queue.ts

### Task 6.6: Main Entry
- [ ] Create src/core/index.ts
- [ ] Create src/index.ts (main exports)

## Phase 7: React Adapter

### Task 7.1: Context and Provider
- [ ] Create src/adapters/react/context.ts
- [ ] Create src/adapters/react/provider.tsx

### Task 7.2: Hooks
- [ ] Create src/adapters/react/hooks/useUploader.ts
- [ ] Create src/adapters/react/hooks/useDropZone.ts
- [ ] Create src/adapters/react/hooks/useFileSelect.ts
- [ ] Create src/adapters/react/hooks/useImagePreview.ts
- [ ] Create src/adapters/react/hooks/index.ts

### Task 7.3: Components
- [ ] Create src/adapters/react/components/DropZone.tsx
- [ ] Create src/adapters/react/components/FileInput.tsx
- [ ] Create src/adapters/react/components/FileList.tsx
- [ ] Create src/adapters/react/components/UploadProgress.tsx
- [ ] Create src/adapters/react/components/ImagePreview.tsx
- [ ] Create src/adapters/react/components/index.ts

### Task 7.4: React Entry
- [ ] Create src/adapters/react/index.ts

## Phase 8: Unit Tests

### Task 8.1: Utility Tests
- [ ] Create tests/unit/utils/id.test.ts
- [ ] Create tests/unit/utils/file.test.ts
- [ ] Create tests/unit/utils/mime.test.ts
- [ ] Create tests/unit/utils/size.test.ts
- [ ] Create tests/unit/utils/reader.test.ts

### Task 8.2: Validation Tests
- [ ] Create tests/unit/validation/size.test.ts
- [ ] Create tests/unit/validation/type.test.ts
- [ ] Create tests/unit/validation/image.test.ts
- [ ] Create tests/unit/validation/validator.test.ts
- [ ] Create tests/unit/validation/validators.test.ts

### Task 8.3: Preview Tests
- [ ] Create tests/unit/preview/dimensions.test.ts
- [ ] Create tests/unit/preview/image-preview.test.ts
- [ ] Create tests/unit/preview/compress.test.ts

### Task 8.4: Upload Tests
- [ ] Create tests/unit/upload/progress.test.ts
- [ ] Create tests/unit/upload/xhr.test.ts
- [ ] Create tests/unit/upload/retry.test.ts
- [ ] Create tests/unit/upload/chunked.test.ts

### Task 8.5: Core Tests
- [ ] Create tests/unit/core/config.test.ts
- [ ] Create tests/unit/core/events.test.ts
- [ ] Create tests/unit/core/file-item.test.ts
- [ ] Create tests/unit/core/uploader.test.ts
- [ ] Create tests/unit/core/drop-zone.test.ts
- [ ] Create tests/unit/core/queue.test.ts

### Task 8.6: React Tests
- [ ] Create tests/unit/react/hooks.test.tsx
- [ ] Create tests/unit/react/components.test.tsx

## Phase 9: Integration Tests

### Task 9.1: Complete Workflows
- [ ] Create tests/integration/uploader.test.ts
- [ ] Create tests/integration/dropzone.test.ts
- [ ] Create tests/integration/chunked.test.ts
- [ ] Create tests/integration/queue.test.ts
- [ ] Create tests/integration/react.test.tsx

### Task 9.2: Test Fixtures
- [ ] Create tests/fixtures/files.ts
- [ ] Create tests/fixtures/mocks.ts
- [ ] Create tests/setup.ts

## Phase 10: Documentation Website

### Task 10.1: Website Setup
- [ ] Create website/ directory
- [ ] Initialize Vite + React
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Configure React Router

### Task 10.2: Layout
- [ ] Create Header component
- [ ] Create Sidebar component
- [ ] Create Footer component
- [ ] Create Layout wrapper

### Task 10.3: Pages
- [ ] Create Home page
- [ ] Create Getting Started page
- [ ] Create Upload pages
- [ ] Create DropZone page
- [ ] Create Validation page
- [ ] Create Chunked Upload page
- [ ] Create Preview page
- [ ] Create API Reference pages
- [ ] Create React Guide pages
- [ ] Create Examples page

### Task 10.4: Components
- [ ] Create CodeBlock component
- [ ] Create LiveDemo component
- [ ] Create APITable component
- [ ] Create InstallCommand component

### Task 10.5: Deployment
- [ ] Create .github/workflows/deploy-website.yml
- [ ] Configure GitHub Pages

## Phase 11: Finalization

### Task 11.1: Documentation
- [ ] Create README.md
- [ ] Create CHANGELOG.md

### Task 11.2: Examples
- [ ] Create examples/basic/
- [ ] Create examples/dropzone/
- [ ] Create examples/chunked/
- [ ] Create examples/queue/
- [ ] Create examples/validation/
- [ ] Create examples/react/

### Task 11.3: Final Checks
- [ ] Run all tests (100% coverage)
- [ ] Build package
- [ ] Check bundle size (< 4KB)
- [ ] Test in example projects
- [ ] Verify TypeScript declarations

## Execution Order

1. Phase 1: Project Setup
2. Phase 2: Core Types and Utilities
3. Phase 3: Validation Module
4. Phase 4: Preview Module
5. Phase 5: Upload Module
6. Phase 6: Core Classes
7. Phase 7: React Adapter
8. Phase 8: Unit Tests (parallel with implementation)
9. Phase 9: Integration Tests
10. Phase 10: Documentation Website
11. Phase 11: Finalization

## Notes

- Each task must be completed before moving to dependent tasks
- Tests should be written alongside implementation
- Code review checklist:
  - No external dependencies
  - TypeScript strict mode compliance
  - 100% test coverage
  - Bundle size under limit
  - Memory leaks prevented
