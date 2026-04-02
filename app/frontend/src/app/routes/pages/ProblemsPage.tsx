import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentLayout } from '../../../components/layout/StudentLayout'
import { listProblems } from '../../../features/problems/api/problemsApi'
import type { Problem } from '../../../features/problems/types'

export function ProblemsPage() {
    const navigate = useNavigate()
    const [problems, setProblems] = useState<Problem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadProblems = async () => {
            setIsLoading(true)
            setErrorMessage(null)

            try {
                const response = await listProblems()
                if (!isMounted) {
                    return
                }

                setProblems(response.problems)
            } catch (error) {
                if (!isMounted) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Failed to load problems'
                setErrorMessage(message)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadProblems()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <StudentLayout
            currentPage="problems"
            title="Problems"
            subtitle="Temporary page showing problems from GET /problems/."
            showHeader={false}
        >
            <div className="space-y-4">
                <section className="rounded-xl border border-border bg-card p-4">
                    <h1 className="text-2xl font-semibold text-foreground">Problems</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Data source: GET /problems/
                    </p>
                </section>

                {isLoading ? (
                    <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                        Loading problems...
                    </section>
                ) : null}

                {errorMessage ? (
                    <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                        {errorMessage}
                    </section>
                ) : null}

                {!isLoading && !errorMessage ? (
                    <section className="rounded-xl border border-border bg-card p-4">
                        <div className="mb-3 text-sm text-muted-foreground">
                            Total loaded: {problems.length}
                        </div>
                        <div className="space-y-3">
                            {problems.map((problem) => (
                                <button
                                    key={problem.id}
                                    type="button"
                                    onClick={() => navigate(`/code-lab?problemId=${problem.id}`)}
                                    className="w-full rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/30"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-medium text-foreground">{problem.title}</h2>
                                        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                            {problem.difficulty}
                                        </span>
                                        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                            {problem.topic}
                                        </span>
                                    </div>
                                </button>
                            ))}

                            {problems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No problems found.</p>
                            ) : null}
                        </div>
                    </section>
                ) : null}
            </div>
        </StudentLayout>
    )
}
