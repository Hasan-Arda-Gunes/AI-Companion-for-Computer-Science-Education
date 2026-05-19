import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Copy, Check, Edit3, Eye, Maximize2, Minimize2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ProblemForm } from './questionCreationTypes'
import { ScrollArea } from '../ui/scroll-area'

export type QuestionPanelProps = {
    problemForm: ProblemForm
    onChange: Dispatch<SetStateAction<ProblemForm>>
    onMaximize: () => void
    onCollapse: () => void
    onSubmit: () => void
    isLoading: boolean
    isCollapsed: boolean
    isMaximized: boolean
}

type LeftPanelView = 'edit' | 'preview'

export function QuestionPanel({
    problemForm,
    onChange,
    onMaximize,
    onCollapse,
    onSubmit,
    isLoading,
    isCollapsed,
    isMaximized,
}: QuestionPanelProps) {
    const [leftView, setLeftView] = useState<LeftPanelView>('preview')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="h-full flex flex-col bg-[var(--charcoal)] border-r border-[var(--border)]">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--slate-gray)]/30 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setLeftView('edit')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${leftView === 'edit'
                            ? 'bg-[var(--electric-purple)] text-white shadow-md'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--slate-gray)]'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </div>
                    </button>
                    <button
                        onClick={() => setLeftView('preview')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${leftView === 'preview'
                            ? 'bg-[var(--electric-purple)] text-white shadow-md'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--slate-gray)]'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                        </div>
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleCopy(`${problemForm.title}\n\n${problemForm.description}`, 'preview')}
                        className="p-1.5 rounded-md hover:bg-[var(--slate-gray)] transition-colors"
                        title="Copy markdown"
                    >
                        {copiedId === 'preview' ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        )}
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
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        )}
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <ScrollArea className="min-h-0 flex-1">
                    {leftView === 'edit' ? (
                        <div className="p-4 space-y-5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3">
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={problemForm.title}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                        placeholder="e.g. Two Sum"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Difficulty
                                    </label>
                                    <select
                                        value={problemForm.difficulty}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                difficulty: e.target.value as ProblemForm['difficulty'],
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Topic
                                    </label>
                                    <input
                                        type="text"
                                        value={problemForm.topic}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                topic: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                        placeholder="e.g. arrays"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Function Name
                                    </label>
                                    <input
                                        type="text"
                                        value={problemForm.function_name}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                function_name: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                        placeholder="e.g. two_sum"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={problemForm.description}
                                    onChange={(e) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)] resize-none leading-relaxed"
                                    placeholder="Describe the problem..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                    Starter Code
                                </label>
                                <textarea
                                    rows={4}
                                    value={problemForm.starter_code}
                                    onChange={(e) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            starter_code: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 bg-[var(--charcoal)] border border-[var(--border)] rounded-lg text-sm font-mono text-[var(--electric-purple)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)] resize-none"
                                    placeholder="def solve():\n    pass"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                                        Examples
                                    </label>
                                    <button
                                        onClick={() =>
                                            onChange((prev) => ({
                                                ...prev,
                                                examples: [
                                                    ...prev.examples,
                                                    {
                                                        id: `ex${Date.now()}`,
                                                        input: '',
                                                        expected_output: '',
                                                    },
                                                ],
                                            }))
                                        }
                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--electric-purple)]/20 hover:bg-[var(--electric-purple)]/30 text-[var(--electric-purple)] text-xs transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {problemForm.examples.map((ex, i) => (
                                        <div key={ex.id} className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--muted-foreground)] w-5 shrink-0">#{i + 1}</span>
                                            <input
                                                type="text"
                                                value={ex.input}
                                                onChange={(e) =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        examples: prev.examples.map((item) =>
                                                            item.id === ex.id
                                                                ? {
                                                                    ...item,
                                                                    input: e.target.value,
                                                                }
                                                                : item
                                                        ),
                                                    }))
                                                }
                                                className="flex-1 px-2.5 py-1.5 bg-[var(--slate-gray)] border border-[var(--border)] rounded text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)]"
                                                placeholder='e.g. [1, 2] or "hello"'
                                            />
                                            <span className="text-[var(--muted-foreground)] text-xs">-&gt;</span>
                                            <input
                                                type="text"
                                                value={ex.expected_output}
                                                onChange={(e) =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        examples: prev.examples.map((item) =>
                                                            item.id === ex.id
                                                                ? {
                                                                    ...item,
                                                                    expected_output: e.target.value,
                                                                }
                                                                : item
                                                        ),
                                                    }))
                                                }
                                                className="flex-1 px-2.5 py-1.5 bg-[var(--slate-gray)] border border-[var(--border)] rounded text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)]"
                                                placeholder='e.g. [0, 1] or "answer"'
                                            />
                                            <button
                                                onClick={() =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        examples: prev.examples.filter((item) => item.id !== ex.id),
                                                    }))
                                                }
                                                className="p-1 rounded hover:bg-red-500/20 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                                        Hints
                                    </label>
                                    <button
                                        onClick={() =>
                                            onChange((prev) => ({
                                                ...prev,
                                                hints: [...prev.hints, ''],
                                            }))
                                        }
                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--electric-purple)]/20 hover:bg-[var(--electric-purple)]/30 text-[var(--electric-purple)] text-xs transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {problemForm.hints.map((hint, i) => (
                                        <div key={`${i}-hint`} className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--muted-foreground)] w-5 shrink-0">#{i + 1}</span>
                                            <input
                                                type="text"
                                                value={hint}
                                                onChange={(e) =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        hints: prev.hints.map((item, index) =>
                                                            index === i ? e.target.value : item
                                                        ),
                                                    }))
                                                }
                                                className="flex-1 px-2.5 py-1.5 bg-[var(--slate-gray)] border border-[var(--border)] rounded text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)]"
                                                placeholder="Hint text..."
                                            />
                                            <button
                                                onClick={() =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        hints: prev.hints.filter((_, index) => index !== i),
                                                    }))
                                                }
                                                className="p-1 rounded hover:bg-red-500/20 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Time Limit (ms)
                                    </label>
                                    <input
                                        type="number"
                                        value={problemForm.time_limit}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                time_limit: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                                        Memory Limit (MB)
                                    </label>
                                    <input
                                        type="number"
                                        value={problemForm.memory_limit}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                memory_limit: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--slate-gray)] border border-[var(--border)] rounded-lg text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--electric-purple)] focus:ring-1 focus:ring-[var(--electric-purple)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
                                    Evaluation Criteria
                                </label>
                                <div className="flex flex-col gap-2">
                                    {(['check_correctness', 'check_efficiency'] as const).map((key) => (
                                        <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                                            <button
                                                role="checkbox"
                                                aria-checked={problemForm[key]}
                                                onClick={() =>
                                                    onChange((prev) => ({
                                                        ...prev,
                                                        [key]: !prev[key],
                                                    }))
                                                }
                                                className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${problemForm[key]
                                                    ? 'bg-[var(--electric-purple)] border-[var(--electric-purple)]'
                                                    : 'border-[var(--border)] bg-[var(--slate-gray)]'
                                                    }`}
                                            >
                                                {problemForm[key] && <Check className="w-2.5 h-2.5 text-white" />}
                                            </button>
                                            <span className="text-xs text-[var(--foreground)] group-hover:text-[var(--electric-purple)] transition-colors">
                                                {key === 'check_correctness' ? 'Check Correctness' : 'Check Efficiency'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-1 pb-2">
                                <button
                                    onClick={onSubmit}
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[var(--electric-purple)] to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--electric-purple-glow)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating...' : 'Create Problem'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="prose prose-invert max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code
                                                    className="bg-[var(--slate-gray)] px-1.5 py-0.5 rounded text-sm text-[var(--electric-purple)]"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            )
                                        },
                                        h1: ({ children }) => (
                                            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-[var(--muted-foreground)] mb-4 leading-relaxed">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside text-[var(--muted-foreground)] mb-4 space-y-1">
                                                {children}
                                            </ul>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="text-[var(--foreground)] font-semibold">{children}</strong>
                                        ),
                                    }}
                                >
                                    {[
                                        `# ${problemForm.title || 'Untitled'}`,
                                        `\n**Difficulty:** ${problemForm.difficulty} &nbsp;|&nbsp; **Topic:** ${problemForm.topic}`,
                                        `\n## Problem Statement\n\n${problemForm.description}`,
                                        problemForm.examples.length > 0
                                            ? `\n## Examples\n\n${problemForm.examples
                                                .map(
                                                    (ex, i) =>
                                                        `### Example ${i + 1}:\n\`\`\`\nInput: ${ex.input}\nOutput: ${ex.expected_output}\n\`\`\``
                                                )
                                                .join('\n\n')}`
                                            : '',
                                        `\n## Starter Code\n\n\`\`\`python\n${problemForm.starter_code}\n\`\`\``,
                                        problemForm.hints.filter(Boolean).length > 0
                                            ? `\n## Hints\n\n${problemForm.hints
                                                .filter(Boolean)
                                                .map((hint, i) => `${i + 1}. ${hint}`)
                                                .join('\n')}`
                                            : '',
                                        `\n## Constraints\n\n- Time limit: ${problemForm.time_limit}ms\n- Memory limit: ${problemForm.memory_limit}MB`,
                                    ].join('\n')}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            )}
        </div>
    )
}
