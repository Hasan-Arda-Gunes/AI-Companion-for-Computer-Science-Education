import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { StudentLayout } from '../../../components/layout/StudentLayout'
import { createProblem } from '../../../features/problems/api/problemsApi'
import type { CreateProblemRequest } from '../../../features/problems/types'

const CREATE_QUESTION_DRAFT_KEY = 'student.createQuestion.tempDraft'

type CreateQuestionDraft = {
    title: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    topic: string
    description: string
}

const defaultDraft: CreateQuestionDraft = {
    title: '',
    difficulty: 'beginner',
    topic: '',
    description: '',
}

function loadDraftFromStorage(): CreateQuestionDraft {
    if (typeof window === 'undefined') {
        return defaultDraft
    }

    const raw = window.localStorage.getItem(CREATE_QUESTION_DRAFT_KEY)
    if (!raw) {
        return defaultDraft
    }

    try {
        const parsed = JSON.parse(raw) as Partial<CreateQuestionDraft>

        return {
            title: parsed.title ?? defaultDraft.title,
            difficulty: parsed.difficulty ?? defaultDraft.difficulty,
            topic: parsed.topic ?? defaultDraft.topic,
            description: parsed.description ?? defaultDraft.description,
        }
    } catch {
        return defaultDraft
    }
}

export function StudentCreateQuestionTempPage() {
    const [draft, setDraft] = useState<CreateQuestionDraft>(() => loadDraftFromStorage())
    const [descriptionView, setDescriptionView] = useState<'write' | 'preview'>('write')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

    useEffect(() => {
        window.localStorage.setItem(CREATE_QUESTION_DRAFT_KEY, JSON.stringify(draft))
    }, [draft])

    const insertMarkdownSnippet = (snippet: string) => {
        setDraft((prev) => ({
            ...prev,
            description: prev.description ? `${prev.description}\n${snippet}` : snippet,
        }))
    }

    const handleCreateProblem = async () => {
        const title = draft.title.trim()
        const description = draft.description.trim()
        const topic = draft.topic.trim()

        if (!title || !description || !topic) {
            setSubmitSuccess(null)
            setSubmitError('Title, topic, and description are required.')
            return
        }

        const payload: CreateProblemRequest = {
            title,
            description,
            difficulty: draft.difficulty,
            topic,
            examples: [
                {
                    input: ['sample_input'],
                    expected_output: 'sample_output',
                },
            ],
            test_cases: [
                {
                    id: 'temp_test_1',
                    input: ['sample_input'],
                    expected_output: 'sample_output',
                    function_name: 'solution',
                },
            ],
            starter_code: 'def solution():\n    pass',
            evaluation_criteria: {
                check_correctness: true,
                check_efficiency: true,
            },
            hints: ['Think about edge cases first.'],
            time_limit: 5000,
            memory_limit: 256,
        }

        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        try {
            const created = await createProblem(payload)
            setSubmitSuccess(`Problem created successfully with id ${created.id}.`)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create problem'
            setSubmitError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <StudentLayout
            currentPage="create-question"
            title="Create Question"
            subtitle="Temporary page for question creation flow."
            showHeader={false}
        >
            <div className="space-y-4">
                <section className="rounded-xl border border-border bg-card p-5">
                    <h1 className="text-2xl font-semibold text-foreground">Create Question (Temp)</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This is a temporary page connected from the student sidebar.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Publish uses POST /problems/.
                    </p>
                </section>

                {submitError ? (
                    <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                        {submitError}
                    </section>
                ) : null}

                {submitSuccess ? (
                    <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                        {submitSuccess}
                    </section>
                ) : null}

                <section className="rounded-xl border border-border bg-card p-5">
                    <form className="grid gap-4 lg:grid-cols-2">
                        <label className="block space-y-2 lg:col-span-2">
                            <span className="text-sm text-muted-foreground">Question Title</span>
                            <input
                                type="text"
                                value={draft.title}
                                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm"
                                placeholder="Example: Valid Parentheses"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm text-muted-foreground">Difficulty</span>
                            <select
                                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm"
                                value={draft.difficulty}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        difficulty: event.target.value as CreateQuestionDraft['difficulty'],
                                    }))
                                }
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm text-muted-foreground">Topic</span>
                            <input
                                type="text"
                                value={draft.topic}
                                onChange={(event) => setDraft((prev) => ({ ...prev, topic: event.target.value }))}
                                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm"
                                placeholder="arrays"
                            />
                        </label>

                        <section className="space-y-2 lg:col-span-2">
                            <span className="text-sm text-muted-foreground">Description</span>

                            <div className="overflow-hidden rounded-lg border border-input">
                                <div className="flex items-center justify-between border-b border-border bg-secondary/30 p-1">
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setDescriptionView('write')}
                                            className={[
                                                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                                descriptionView === 'write'
                                                    ? 'bg-card text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            ].join(' ')}
                                        >
                                            Write
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDescriptionView('preview')}
                                            className={[
                                                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                                descriptionView === 'preview'
                                                    ? 'bg-card text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            ].join(' ')}
                                        >
                                            Preview
                                        </button>
                                    </div>

                                    {descriptionView === 'write' ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdownSnippet('## Section Title')}
                                                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                H2
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdownSnippet('**bold text**')}
                                                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Bold
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdownSnippet('- item one\n- item two')}
                                                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                List
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdownSnippet('```python\n# code here\n```')}
                                                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Code
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                {descriptionView === 'write' ? (
                                    <textarea
                                        value={draft.description}
                                        onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                                        className="h-40 w-full border-0 bg-input-background px-3 py-2 text-sm outline-none"
                                        placeholder="Describe the problem statement and constraints with Markdown."
                                    />
                                ) : (
                                    <div className="h-40 overflow-y-auto bg-input-background p-3">
                                        {draft.description.trim() ? (
                                            <div className="max-w-none space-y-3 text-sm text-foreground">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ children }) => <h1 className="mb-2 text-lg font-semibold">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-semibold">{children}</h2>,
                                                        p: ({ children }) => <p className="mb-2 leading-6 text-muted-foreground">{children}</p>,
                                                        ul: ({ children }) => <ul className="mb-2 list-inside list-disc space-y-1 text-muted-foreground">{children}</ul>,
                                                        code: ({ className, children, ...props }) => {
                                                            const isInline = !className

                                                            if (isInline) {
                                                                return (
                                                                    <code className="rounded bg-secondary px-1 py-0.5 text-xs text-primary" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }

                                                            return (
                                                                <pre className="mb-2 overflow-x-auto rounded-md bg-background p-3 text-xs">
                                                                    <code>{children}</code>
                                                                </pre>
                                                            )
                                                        },
                                                    }}
                                                >
                                                    {draft.description}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="flex gap-3 lg:col-span-2">
                            <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                Save Draft
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateProblem}
                                disabled={isSubmitting}
                                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish (POST /problems/)'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDraft(defaultDraft)
                                    setSubmitError(null)
                                    setSubmitSuccess(null)
                                }}
                                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground"
                            >
                                Clear All
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </StudentLayout>
    )
}
