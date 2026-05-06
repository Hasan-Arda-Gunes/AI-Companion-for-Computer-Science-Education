import { motion } from 'motion/react'
import { ChevronDown, ChevronUp, Eye, EyeOff, FlaskConical, Maximize2, Minimize2, Plus, Trash2 } from 'lucide-react'
import type { TestCase } from './questionCreationTypes'

export type TestCasePanelProps = {
    testCases: TestCase[]
    onAdd: () => void
    onUpdate: (id: string, field: keyof TestCase, value: string | boolean) => void
    onDelete: (id: string) => void
    onMaximize: () => void
    onCollapse: () => void
    isCollapsed: boolean
    isMaximized: boolean
}

export function TestCasePanel({
    testCases,
    onAdd,
    onUpdate,
    onDelete,
    onMaximize,
    onCollapse,
    isCollapsed,
    isMaximized,
}: TestCasePanelProps) {
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
            </div>

            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                                        placeholder="e.g., [2,7,11,15], 9"
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
                                        placeholder="e.g., [0,1]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
