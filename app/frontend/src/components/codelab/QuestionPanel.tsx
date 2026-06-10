import ReactMarkdown from 'react-markdown'
import { Clock, Target, TrendingUp } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import type { QuestionData } from './types'

type QuestionPanelProps = {
    question: QuestionData
    useInternalScroll?: boolean
}

export function QuestionPanel({ question, useInternalScroll = true }: QuestionPanelProps) {
    const exampleSections = question.examples
        .map((example, index) => {
            const lines = [
                `## Example ${index + 1}:`,
                '',
                '```',
                `Input: ${example.input}`,
                `Output: ${example.expected_output}`,
                '```',
            ]

            return lines.join('\n')
        })
        .join('\n\n')

    const constraintLines = question.constraints.map((constraint) => `- \`${constraint}\``).join('\n')

    const markdownContent =
        question.markdownContent ??
        [
            `# ${question.title}`,
            '',
            question.description,
            '',
            exampleSections,
            '',
            '## Constraints:',
            '',
            constraintLines,
            '',
            ...(question.followUp ? ['## Follow-up:', '', question.followUp] : []),
        ].join('\n')

    const complexity = question.complexityTarget ?? {
        time: 'O(n)',
        space: 'O(n)',
    }

    return (
        <section className={[useInternalScroll ? 'flex h-full min-h-0 flex-col' : 'flex flex-col', 'border-r border-border bg-card'].join(' ')}>
            {useInternalScroll ? (
                <ScrollArea className="min-h-0 flex-1 p-6">
                    <QuestionMarkdown markdownContent={markdownContent} />
                </ScrollArea>
            ) : (
                <div className="p-6">
                    <QuestionMarkdown markdownContent={markdownContent} />
                </div>
            )}

            <div className="border-t border-border p-6">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <Target className="size-5 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Complexity Target</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Time</span>
                            </div>
                            <span className="font-mono text-sm text-primary">{complexity.time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Space</span>
                            </div>
                            <span className="font-mono text-sm text-primary">{complexity.space}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

type QuestionMarkdownProps = {
    markdownContent: string
}

function QuestionMarkdown({ markdownContent }: QuestionMarkdownProps) {
    return (
        <div className="max-w-none space-y-4">
            <ReactMarkdown
                components={{
                    h1: ({ children }) => <h1 className="mb-4 mt-0 text-2xl font-semibold text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">{children}</h2>,
                    p: ({ children }) => <p className="mb-4 text-sm leading-6 text-muted-foreground">{children}</p>,
                    code: ({ className, children, ...props }) => {
                        const isInline = !className

                        if (isInline) {
                            return (
                                <code className="rounded bg-secondary px-1.5 py-0.5 text-sm text-primary" {...props}>
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <pre className="mb-4 overflow-x-auto rounded-lg bg-background p-4">
                                <code className="text-sm text-foreground">{children}</code>
                            </pre>
                        )
                    },
                    ul: ({ children }) => <ul className="mb-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">{children}</ul>,
                    li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                    strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                }}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    )
}
