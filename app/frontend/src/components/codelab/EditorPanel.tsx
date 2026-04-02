import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Editor from '@monaco-editor/react'
import type { CodeEditorData, CodeLanguageOption } from './types'

type EditorPanelProps = {
    editor: CodeEditorData
    isRunning?: boolean
    onRunCode?: (code: string, languageId: string) => void
    onCodeChange?: (code: string, languageId: string) => void
}

const FALLBACK_TEMPLATE = '// Write your code here'

export function EditorPanel({ editor, isRunning = false, onRunCode, onCodeChange }: EditorPanelProps) {
    const initialLanguage = useMemo(
        () => editor.languages.find((language) => language.id === editor.defaultLanguageId) ?? editor.languages[0],
        [editor.defaultLanguageId, editor.languages],
    )

    const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguageOption>(initialLanguage)
    const [code, setCode] = useState(editor.codeTemplates[initialLanguage.id] ?? FALLBACK_TEMPLATE)
    const [showLanguageMenu, setShowLanguageMenu] = useState(false)

    useEffect(() => {
        const nextLanguage = editor.languages.find((language) => language.id === editor.defaultLanguageId) ?? editor.languages[0]
        setSelectedLanguage(nextLanguage)
        setCode(editor.codeTemplates[nextLanguage.id] ?? FALLBACK_TEMPLATE)
    }, [editor.defaultLanguageId, editor.languages, editor.codeTemplates])

    useEffect(() => {
        onCodeChange?.(code, selectedLanguage.id)
    }, [code, selectedLanguage.id, onCodeChange])

    const currentFileName = `${editor.fileBaseName}${selectedLanguage.extension}`

    const handleLanguageChange = (language: CodeLanguageOption) => {
        setSelectedLanguage(language)
        setCode(editor.codeTemplates[language.id] ?? FALLBACK_TEMPLATE)
        setShowLanguageMenu(false)
    }

    const handleEditorChange = (value: string | undefined) => {
        setCode(value ?? '')
    }

    return (
        <section className="grid h-full grid-rows-[auto_1fr_auto] border-l border-r border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="size-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-sm text-muted-foreground">{currentFileName}</span>
                </div>

                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowLanguageMenu((prev) => !prev)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary"
                    >
                        <span>{selectedLanguage.name}</span>
                        <ChevronDown className="size-4" />
                    </motion.button>

                    <AnimatePresence>
                        {showLanguageMenu ? (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close language menu"
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowLanguageMenu(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
                                >
                                    <div className="max-h-80 overflow-y-auto">
                                        {editor.languages.map((language) => (
                                            <button
                                                key={language.id}
                                                type="button"
                                                onClick={() => handleLanguageChange(language)}
                                                className={[
                                                    'w-full px-4 py-2 text-left text-sm transition-colors',
                                                    selectedLanguage.id === language.id
                                                        ? 'bg-primary/20 text-primary'
                                                        : 'text-foreground hover:bg-secondary',
                                                ].join(' ')}
                                            >
                                                {language.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            <div className="overflow-hidden">
                <Editor
                    height="100%"
                    language={selectedLanguage.id}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        bracketPairColorization: {
                            enabled: true,
                        },
                    }}
                    beforeMount={(monaco) => {
                        monaco.editor.defineTheme('code-evolution-dark', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [
                                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                                { token: 'keyword', foreground: 'a855f7' },
                                { token: 'string', foreground: '34d399' },
                                { token: 'number', foreground: '60a5fa' },
                                { token: 'function', foreground: 'fbbf24' },
                                { token: 'variable', foreground: 'e5e7eb' },
                                { token: 'type', foreground: '8b5cf6' },
                            ],
                            colors: {
                                'editor.background': '#0f1419',
                                'editor.foreground': '#e5e7eb',
                                'editor.lineHighlightBackground': '#1a1f2e',
                                'editorLineNumber.foreground': '#6b7280',
                                'editorLineNumber.activeForeground': '#a855f7',
                                'editor.selectionBackground': '#374151',
                                'editor.inactiveSelectionBackground': '#1f2937',
                                'editorCursor.foreground': '#a855f7',
                                'editorWhitespace.foreground': '#374151',
                            },
                        })
                    }}
                    onMount={(_, monaco) => {
                        monaco.editor.setTheme('code-evolution-dark')
                    }}
                />
            </div>

            <div className="border-t border-border bg-secondary px-4 py-3">
                <motion.button
                    whileHover={!isRunning ? { scale: 1.01 } : {}}
                    whileTap={!isRunning ? { scale: 0.99 } : {}}
                    type="button"
                    onClick={() => !isRunning && onRunCode?.(code, selectedLanguage.id)}
                    disabled={isRunning}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isRunning ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                            />
                            <span>Running...</span>
                        </>
                    ) : (
                        <>
                            <Play className="size-4" fill="currentColor" />
                            <span>{editor.runButtonLabel ?? 'Run Code'}</span>
                        </>
                    )}
                </motion.button>
            </div>
        </section>
    )
}
