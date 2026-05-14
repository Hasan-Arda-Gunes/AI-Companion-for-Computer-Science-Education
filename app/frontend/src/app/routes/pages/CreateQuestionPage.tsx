import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { InstructorLayout } from '../../../components/layout/InstructorLayout'

export function CreateQuestionPage() {
    const [prompt, setPrompt] = useState('')
    const [promptView, setPromptView] = useState<'write' | 'preview'>('write')

    return (
        <InstructorLayout
            currentPage="create-question"
            title="Create Question"
            subtitle="Instructor authoring surface for composing, categorizing, and previewing new questions."
        >
            <article className="rounded-xl border border-border bg-card p-5">
                <form className="grid gap-4 lg:grid-cols-2">
                    <label className="block space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Question Title</span>
                        <input className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Example: Merge Intervals" />
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Difficulty</span>
                        <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Subject</span>
                        <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm">
                            <option>Arrays</option>
                            <option>Linked Lists</option>
                            <option>Graphs</option>
                        </select>
                    </label>

                    <section className="space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Prompt</span>
                        <div className="overflow-hidden rounded-lg border border-input">
                            <div className="flex items-center border-b border-border bg-secondary/30 p-1">
                                <button
                                    type="button"
                                    onClick={() => setPromptView('write')}
                                    className={[
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        promptView === 'write'
                                            ? 'bg-card text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPromptView('preview')}
                                    className={[
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        promptView === 'preview'
                                            ? 'bg-card text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                >
                                    Preview
                                </button>
                            </div>

                            {promptView === 'write' ? (
                                <textarea
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    className="h-40 w-full border-0 bg-input-background px-3 py-2 text-sm outline-none"
                                    placeholder="Describe the question and constraints with Markdown."
                                />
                            ) : (
                                <div className="h-40 overflow-y-auto bg-input-background p-3">
                                    {prompt.trim() ? (
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
                                                {prompt}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <label className="block space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Hidden Test Cases</span>
                        <textarea className="h-28 w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Static placeholder for hidden tests." />
                    </label>

                    <div className="lg:col-span-2 flex flex-wrap gap-3">
                        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                            Save Draft
                        </button>
                        <button type="button" className="rounded-lg border border-border px-4 py-2 text-sm">
                            Publish
                        </button>
                    </div>
                </form>
            </article>
        </InstructorLayout>
    )
}
