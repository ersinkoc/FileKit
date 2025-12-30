import { Outlet, Link, useLocation } from 'react-router-dom'
import { Upload, Menu, X, Github, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { name: 'Getting Started', href: '/docs/getting-started' },
  { name: 'Upload', href: '/docs/upload' },
  { name: 'Drop Zone', href: '/docs/dropzone' },
  { name: 'Validation', href: '/docs/validation' },
  { name: 'Chunked Upload', href: '/docs/chunked' },
  { name: 'Preview', href: '/docs/preview' },
  { name: 'React', href: '/docs/react' },
  { name: 'API Reference', href: '/docs/api' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isDocsPage = location.pathname.startsWith('/docs')

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">FileKit</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/docs/getting-started"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Docs
                </Link>
                <Link
                  to="/examples"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Examples
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-800"
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm ${
                      location.pathname === item.href
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <div className="pt-16">
        {isDocsPage ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Sidebar */}
              <aside className="hidden lg:block w-64 shrink-0 py-8">
                <nav className="sticky top-24 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-3 py-2 rounded-lg text-sm ${
                        location.pathname === item.href
                          ? 'bg-violet-500/10 text-violet-400 font-medium'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </aside>

              {/* Content */}
              <main className="flex-1 min-w-0 py-8">
                <Outlet />
              </main>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Upload className="h-4 w-4" />
              <span>FileKit - Zero-dependency file uploads</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
