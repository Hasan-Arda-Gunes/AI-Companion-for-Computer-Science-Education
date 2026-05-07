import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listMyClasses } from '../../../features/classes/api/classesApi'
import type { ClassSummary } from '../../../features/classes/types'
import { listProblems } from '../../../features/problems/api/problemsApi'
import type { Problem, ProblemDifficulty } from '../../../features/problems/types'
import { StudentLayout } from '../../../components/layout/StudentLayout'

export function ProblemsPage() {
    const navigate = useNavigate()
    const [problems, setProblems] = useState<Problem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [difficultyValue, setDifficultyValue] = useState<ProblemDifficulty | ''>('')
    const [topicValue, setTopicValue] = useState('')
    const [classValue, setClassValue] = useState<number | ''>('')
    const [classes, setClasses] = useState<ClassSummary[]>([])

    const fetchProblems = useCallback(
        async (params?: { search?: string; difficulty?: ProblemDifficulty; topic?: string; class_id?: number }) => {
            setIsLoading(true)
            setErrorMessage(null)

            try {
                const response = await listProblems(params)
                setProblems(response.problems ?? [])
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load problems'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        },
        [],
    )

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const classesData = await listMyClasses()
                setClasses(classesData)
            } catch {
                // Silently fail for classes load
            }
        }

        void loadClasses()
    }, [])

    useEffect(() => {
        void fetchProblems()
    }, [fetchProblems])

    const handleApplyFilters = () => {
        void fetchProblems({
            search: searchValue.trim() || undefined,
            difficulty: difficultyValue || undefined,
            topic: topicValue.trim() || undefined,
            class_id: classValue ? Number(classValue) : undefined,
        })
    }

    const handleClearFilters = () => {
        setSearchValue('')
        setDifficultyValue('')
        setTopicValue('')
        setClassValue('')
    }

    return (
        <StudentLayout
            currentPage="problems"
            title="Problems"
            subtitle="Browse problems and filter by class."
            showHeader={false}
        >
            <div className="space-y-4">
                <section className="rounded-xl border border-border bg-card p-4">
                    <h1 className="text-2xl font-semibold text-foreground">Problems</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Data source: GET /problems/</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search title or description"
                            className="min-w-56 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <select
                            value={difficultyValue}
                            onChange={(event) => setDifficultyValue(event.target.value as ProblemDifficulty | '')}
                            className="min-w-45 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="">All difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <input
                            value={topicValue}
                            onChange={(event) => setTopicValue(event.target.value)}
                            placeholder="Topic"
                            className="min-w-40 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <select
                            value={classValue}
                            onChange={(event) =>
                                setClassValue(event.target.value ? Number(event.target.value) : '')
                            }
                            className="min-w-45 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="">All classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleApplyFilters}
                            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                        >
                            Apply filters
                        </button>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
                        >
                            Clear
                        </button>
                    </div>
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
                        <div className="mb-3 text-sm text-muted-foreground">Total loaded: {problems.length}</div>
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
                                        {problem.class_id ? (
                                            <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                Class: {problem.class_id}
                                            </span>
                                        ) : null}
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
