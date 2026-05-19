import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, ChevronUp, Eye, EyeOff, FlaskConical, Maximize2, Minimize2, Plus, Trash2 } from 'lucide-react'
import type { TestCase } from './questionCreationTypes'
import { ScrollArea } from '../ui/scroll-area'

export type TestCasePanelProps = {
    testCases: TestCase[]
    onAdd: () => void
    onUpdate: (id: string, field: keyof TestCase, value: string | boolean) => void
    onDelete: (id: string) => void
    onReplaceAll: (testCases: TestCase[]) => void
    onMaximize: () => void
    onCollapse: () => void
    isCollapsed: boolean
    isMaximized: boolean
}

type JsonTestCaseRecord = {
    id?: string | number
    input?: unknown
    expectedOutput?: unknown
    expected_output?: unknown
    isHidden?: boolean
    is_hidden?: boolean
}

function parseIfJson(value: string): unknown {
    const trimmed = value.trim()
    if (!trimmed) return ''

    try {
        return JSON.parse(trimmed)
    } catch {
        return value
    }
}

function stringifyForEditor(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    if (value === undefined) {
        return ''
    }

    try {
        return JSON.stringify(value)
    } catch {
        return String(value)
    }
}

function formatTestCasesAsJson(testCases: TestCase[]): string {
    const payload = testCases.map((testCase) => ({
        id: testCase.id,
        input: parseIfJson(testCase.input),
        expected_output: parseIfJson(testCase.expectedOutput),
        is_hidden: testCase.isHidden,
    }))

    return JSON.stringify(payload, null, 2)
}

function parseRawTestCases(rawJson: string): TestCase[] {
    const parsed = JSON.parse(rawJson) as unknown

    if (!Array.isArray(parsed)) {
        throw new Error('Test cases JSON must be an array.')
    }

    return parsed.map((item, index) => {
        if (!item || typeof item !== 'object') {
            throw new Error(`Invalid test case at index ${index}. Expected an object.`)
        }

        const record = item as JsonTestCaseRecord
        const rawExpectedOutput = record.expectedOutput ?? record.expected_output

        return {
            id: String(index + 1),
            input: stringifyForEditor(record.input),
            expectedOutput: stringifyForEditor(rawExpectedOutput),
            isHidden: typeof record.isHidden === 'boolean' ? record.isHidden : Boolean(record.is_hidden),
        }
    })
}

export function TestCasePanel({
    testCases,
    onAdd,
    onUpdate,
    onDelete,
    onReplaceAll,
    onMaximize,
    onCollapse,
    isCollapsed,
    isMaximized,
}: TestCasePanelProps) {
    const [showRawJson, setShowRawJson] = useState(false)
    const [rawJson, setRawJson] = useState(formatTestCasesAsJson(testCases))
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [isRawJsonDirty, setIsRawJsonDirty] = useState(false)
    const importInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (isRawJsonDirty) return
        setRawJson(formatTestCasesAsJson(testCases))
    }, [isRawJsonDirty, testCases])

    const applyRawJson = () => {
        try {
            const parsed = parseRawTestCases(rawJson)
            onReplaceAll(parsed)
            setJsonError(null)
            setIsRawJsonDirty(false)
            setRawJson(formatTestCasesAsJson(parsed))
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Invalid JSON format.')
        }
    }

    const exportTestCases = () => {
        const blob = new Blob([formatTestCasesAsJson(testCases)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'test-cases.json'
        anchor.click()
        URL.revokeObjectURL(url)
    }

    const openImportDialog = () => {
        importInputRef.current?.click()
    }

    const importTestCases = async (file: File) => {
        try {
            const content = await file.text()
            const parsed = parseRawTestCases(content)
            onReplaceAll(parsed)
            setRawJson(formatTestCasesAsJson(parsed))
            setIsRawJsonDirty(false)
            setJsonError(null)
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Failed to import test cases.')
        }
    }

    const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        void importTestCases(file)
        event.target.value = ''
    }

    return (
        <div className="h-full flex flex-col bg-[var(--charcoal)] border-r border-[var(--border)]">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--slate-gray)]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-[var(--electric-purple)]" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">Test Cases</span>
                    <span className="text-xs text-[var(--muted-foreground)]">({testCases.length})</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onAdd}
                        className="p-1.5 rounded-md hover:bg-[var(--slate-gray)] transition-colors"
                        title="Add test case"
                    >
                        <Plus className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    </button>
                    <button
                        onClick={openImportDialog}
                        className="px-2 py-1 rounded-md hover:bg-[var(--slate-gray)] transition-colors text-xs text-[var(--muted-foreground)]"
                        title="Import test cases from JSON"
                    >
                        Import JSON
                    </button>
                    <button
                        onClick={exportTestCases}
                        className="px-2 py-1 rounded-md hover:bg-[var(--slate-gray)] transition-colors text-xs text-[var(--muted-foreground)]"
                        title="Export test cases as JSON"
                    >
                        Export JSON
                    </button>
                    <button
                        onClick={() => {
                            setShowRawJson((prev) => !prev)
                            setJsonError(null)
                        }}
                        className="px-2 py-1 rounded-md hover:bg-[var(--slate-gray)] transition-colors text-xs text-[var(--muted-foreground)]"
                        title={showRawJson ? 'Hide raw JSON editor' : 'Show raw JSON editor'}
                    >
                        {showRawJson ? 'Hide JSON' : 'Raw JSON'}
                    </button>
                    <button
                        onClick={onMaximize}
                        className="p-1.5 rounded-md hover:bg-[var(--slate-gray)] transition-colors"
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? (
                            <Minimize2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        ) : (
                            <Maximize2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        )}
                    </button>
                    <button
                        onClick={onCollapse}
                        className="p-1.5 rounded-md hover:bg-[var(--slate-gray)] transition-colors"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        )}
                    </button>
                </div>
                <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleImportFileChange}
                />
            </div>

            {!isCollapsed && (
                <ScrollArea className="min-h-0 flex-1">
                    <div className="p-4 space-y-3">
                        {showRawJson && (
                            <div className="p-3 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg space-y-2">
                                <label className="text-xs text-[var(--muted-foreground)] block">
                                    Edit test cases in JSON array format
                                </label>
                                <textarea
                                    value={rawJson}
                                    onChange={(event) => {
                                        setRawJson(event.target.value)
                                        setIsRawJsonDirty(true)
                                        if (jsonError) setJsonError(null)
                                    }}
                                    className="w-full min-h-44 px-2 py-1.5 bg-[var(--charcoal)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)] font-mono"
                                />
                                {jsonError ? (
                                    <div className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                                        {jsonError}
                                    </div>
                                ) : null}
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setRawJson(formatTestCasesAsJson(testCases))
                                            setIsRawJsonDirty(false)
                                            setJsonError(null)
                                        }}
                                        className="px-2 py-1 rounded-md hover:bg-[var(--charcoal)] transition-colors text-xs text-[var(--muted-foreground)]"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={applyRawJson}
                                        className="px-2 py-1 rounded-md bg-[var(--electric-purple)]/20 text-[var(--electric-purple)] hover:bg-[var(--electric-purple)]/30 transition-colors text-xs font-medium"
                                    >
                                        Apply JSON
                                    </button>
                                </div>
                            </div>
                        )}

                        {testCases.map((testCase, index) => (
                            <motion.div
                                key={testCase.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-[var(--foreground)]">
                                            Test Case {index + 1}
                                        </span>
                                        {testCase.isHidden && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onUpdate(testCase.id, 'isHidden', !testCase.isHidden)}
                                            className="p-1 rounded hover:bg-[var(--charcoal)] transition-colors"
                                            title={testCase.isHidden ? 'Make visible' : 'Make hidden'}
                                        >
                                            {testCase.isHidden ? (
                                                <EyeOff className="w-3 h-3 text-[var(--muted-foreground)]" />
                                            ) : (
                                                <Eye className="w-3 h-3 text-[var(--muted-foreground)]" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onDelete(testCase.id)}
                                            className="p-1 rounded hover:bg-[var(--charcoal)] transition-colors"
                                            title="Delete test case"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Input</label>
                                        <input
                                            type="text"
                                            value={testCase.input}
                                            onChange={(e) => onUpdate(testCase.id, 'input', e.target.value)}
                                            className="w-full px-2 py-1.5 bg-[var(--charcoal)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)] font-mono"
                                            placeholder='e.g., [2, 7, 11, 15], 9 or "hello"'
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                                            Expected Output
                                        </label>
                                        <input
                                            type="text"
                                            value={testCase.expectedOutput}
                                            onChange={(e) => onUpdate(testCase.id, 'expectedOutput', e.target.value)}
                                            className="w-full px-2 py-1.5 bg-[var(--charcoal)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)] font-mono"
                                            placeholder='e.g., [0, 1] or "answer"'
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}
