import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: true,
    treeshake: true,
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist',
  },
  {
    entry: { react: 'src/adapters/react/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    treeshake: true,
    sourcemap: true,
    target: 'es2020',
    outDir: 'dist',
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
  },
])
