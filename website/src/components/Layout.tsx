import { Outlet, Link, useLocation } from 'react-router-dom'
import { Upload, Menu, X, Github, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import clsx from 'clsx'

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
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={clsx(
      'min-h-screen transition-colors',
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    )}>
      {/* Header */}
      <header className={clsx(
        'fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-lg transition-colors',
        theme === 'dark'
          ? 'bg-zinc-950/80 border-zinc-800'
          : 'bg-white/80 border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <span className={clsx(
                  'text-lg font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  FileKit
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/docs/getting-started"
                  className={clsx(
                    'text-sm transition-colors',
                    location.pathname.startsWith('/docs')
                      ? 'text-violet-500 font-medium'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-zinc-900'
                  )}
                >
                  Docs
                </Link>
                <Link
                  to="/playground"
                  className={clsx(
                    'text-sm transition-colors',
                    location.pathname === '/playground'
                      ? 'text-violet-500 font-medium'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-zinc-900'
                  )}
                >
                  Playground
                </Link>
                <Link
                  to="/examples"
                  className={clsx(
                    'text-sm transition-colors',
                    location.pathname === '/examples'
                      ? 'text-violet-500 font-medium'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-600 hover:text-zinc-900'
                  )}
                >
                  Examples
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                )}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* GitHub Link */}
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'flex items-center gap-2 text-sm transition-colors p-2 rounded-lg',
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                )}
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={clsx(
                  'md:hidden p-2 rounded-lg transition-colors',
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                )}
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
              className={clsx(
                'md:hidden border-t',
                theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
              )}
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/playground"
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'block px-3 py-2 rounded-lg text-sm',
                    location.pathname === '/playground'
                      ? 'bg-violet-500/10 text-violet-500'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  )}
                >
                  Playground
                </Link>
                <Link
                  to="/examples"
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'block px-3 py-2 rounded-lg text-sm',
                    location.pathname === '/examples'
                      ? 'bg-violet-500/10 text-violet-500'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  )}
                >
                  Examples
                </Link>
                <div className={clsx(
                  'border-t pt-2 mt-2',
                  theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
                )}>
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        'block px-3 py-2 rounded-lg text-sm',
                        location.pathname === item.href
                          ? 'bg-violet-500/10 text-violet-500'
                          : theme === 'dark'
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
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
                      className={clsx(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        location.pathname === item.href
                          ? 'bg-violet-500/10 text-violet-500 font-medium'
                          : theme === 'dark'
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      )}
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
      <footer className={clsx(
        'border-t py-8 mt-16 transition-colors',
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={clsx(
              'flex items-center gap-2 text-sm',
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
            )}>
              <Upload className="h-4 w-4" />
              <span>FileKit - Zero-dependency file uploads</span>
            </div>
            <div className={clsx(
              'flex items-center gap-6 text-sm',
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
            )}>
              <a
                href="https://github.com/ersinkoc/filekit"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'transition-colors',
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-zinc-900'
                )}
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
