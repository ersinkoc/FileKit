import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, copyFileSync } from 'fs'

// Plugin to handle SPA routing on GitHub Pages
const spaFallbackPlugin = () => ({
  name: 'spa-fallback',
  closeBundle() {
    // Copy index.html to 404.html for SPA routing
    const indexPath = resolve(__dirname, 'dist/index.html')
    const fallbackPath = resolve(__dirname, 'dist/404.html')
    copyFileSync(indexPath, fallbackPath)
  }
})

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
          syntax: ['prism-react-renderer'],
        },
      },
    },
  },
})
