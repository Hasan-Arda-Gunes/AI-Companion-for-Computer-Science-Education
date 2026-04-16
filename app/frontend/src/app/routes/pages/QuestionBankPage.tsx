import { InstructorLayout } from '../../../components/layout/InstructorLayout'

const questions = [
    { title: 'Two Sum Variants', difficulty: 'Easy', source: 'Manual' },
    { title: 'Graph Connectivity', difficulty: 'Medium', source: 'AI Generated' },
    { title: 'Balanced Parentheses', difficulty: 'Easy', source: 'Manual' },
]

export function QuestionBankPage() {
    return (
        <InstructorLayout
            currentPage="question-bank"
            title="Question Bank"
            subtitle="Instructor question repository with static placeholders for filters, metadata, and actions."
        >
            <article className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <h2 className="text-lg font-medium">Questions</h2>
                    <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        Add New
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {questions.map((question) => (
                        <div key={question.title} className="rounded-lg border border-border bg-background p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="font-medium">{question.title}</h3>
                                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                                    {question.source}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">Difficulty: {question.difficulty}</p>
                        </div>
                    ))}
                </div>
            </article>
        </InstructorLayout>
    )
}
