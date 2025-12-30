import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Copy, Check, Terminal, FileCode } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import clsx from 'clsx'

interface IDECodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
  className?: string
  variant?: 'ide' | 'terminal' | 'browser'
}

export function IDECodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  className,
  variant = 'ide',
}: IDECodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const prismTheme = theme === 'dark' ? themes.nightOwl : themes.github

  return (
    <div className={clsx(
      'rounded-xl overflow-hidden border shadow-2xl',
      theme === 'dark'
        ? 'bg-[#011627] border-zinc-700/50'
        : 'bg-white border-zinc-200',
      className
    )}>
      {/* Window Chrome */}
      <div className={clsx(
        'flex items-center justify-between px-4 py-3 border-b',
        theme === 'dark'
          ? 'bg-[#011627] border-zinc-700/50'
          : 'bg-zinc-50 border-zinc-200'
      )}>
        <div className="flex items-center gap-3">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Filename Tab */}
          {filename && (
            <div className={clsx(
              'flex items-center gap-2 px-3 py-1 rounded-md text-sm',
              theme === 'dark'
                ? 'bg-zinc-800/50 text-zinc-300'
                : 'bg-zinc-100 text-zinc-600'
            )}>
              {variant === 'terminal' ? (
                <Terminal className="w-4 h-4" />
              ) : (
                <FileCode className="w-4 h-4" />
              )}
              <span className="font-mono">{filename}</span>
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            theme === 'dark'
              ? 'hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200'
              : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700'
          )}
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <Highlight theme={prismTheme} code={code.trim()} language={language}>
        {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={clsx(preClassName, 'overflow-x-auto p-0 m-0')}
            style={{ ...style, background: 'transparent' }}
          >
            <code className="block py-4 font-mono text-sm leading-relaxed">
              {tokens.map((line, i) => {
                const lineNumber = i + 1
                const isHighlighted = highlightLines.includes(lineNumber)

                return (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className={clsx(
                      'flex',
                      isHighlighted && (theme === 'dark'
                        ? 'bg-violet-500/10 border-l-2 border-violet-500'
                        : 'bg-violet-50 border-l-2 border-violet-500')
                    )}
                  >
                    {showLineNumbers && (
                      <span
                        className={clsx(
                          'select-none w-12 px-4 text-right shrink-0',
                          theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'
                        )}
                      >
                        {lineNumber}
                      </span>
                    )}
                    <span className="flex-1 px-4">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                )
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  )
}

// Browser frame variant
interface BrowserFrameProps {
  url?: string
  children: React.ReactNode
  className?: string
}

export function BrowserFrame({ url = 'localhost:3000', children, className }: BrowserFrameProps) {
  const { theme } = useTheme()

  return (
    <div className={clsx(
      'rounded-xl overflow-hidden border shadow-2xl',
      theme === 'dark'
        ? 'bg-zinc-900 border-zinc-700/50'
        : 'bg-white border-zinc-200',
      className
    )}>
      {/* Browser Chrome */}
      <div className={clsx(
        'flex items-center gap-4 px-4 py-3 border-b',
        theme === 'dark'
          ? 'bg-zinc-800 border-zinc-700/50'
          : 'bg-zinc-50 border-zinc-200'
      )}>
        {/* Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* URL Bar */}
        <div className={clsx(
          'flex-1 flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm',
          theme === 'dark'
            ? 'bg-zinc-900/50 text-zinc-400'
            : 'bg-zinc-100 text-zinc-500'
        )}>
          <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
          <span className="font-mono">{url}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
