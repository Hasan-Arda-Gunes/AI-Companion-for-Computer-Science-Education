import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listMyClasses } from '../../../features/classes/api/classesApi'
import type { ClassSummary } from '../../../features/classes/types'
import { deleteProblem, getProblemById, listProblems, updateProblem } from '../../../features/problems/api/problemsApi'
import type { Problem, ProblemDetails, ProblemDifficulty } from '../../../features/problems/types'
import { InstructorLayout } from '../../../components/layout/InstructorLayout'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'

export function QuestionBankPage() {
    const navigate = useNavigate()
    const { user } = useAuthSession()
    const [problems, setProblems] = useState<Problem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)
    const [selectedProblem, setSelectedProblem] = useState<ProblemDetails | null>(null)
    const [isDetailsLoading, setIsDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [actionMessage, setActionMessage] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editDifficulty, setEditDifficulty] = useState<ProblemDifficulty>('beginner')
    const [editTopic, setEditTopic] = useState('')
    const [editClassId, setEditClassId] = useState<number | ''>('')
    const [classes, setClasses] = useState<ClassSummary[]>([])

    const loadProblems = useCallback(async () => {
        if (!user?.id) {
            setProblems([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setErrorMessage(null)

        try {
            const response = await listProblems()
            const hasCreatorInfo = response.problems?.some((problem) => problem.created_by !== undefined && problem.created_by !== null)

            if (hasCreatorInfo) {
                setProblems(response.problems.filter((problem) => problem.created_by === user.id))
            } else {
                console.warn('[QuestionBankPage] Backend did not include creator info on problems; showing all returned problems')
                setActionMessage('Backend did not return creator info; showing all problems.')
                setProblems(response.problems ?? [])
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load problems'
            setErrorMessage(message)
        } finally {
            setIsLoading(false)
        }
    }, [user?.id])

    const loadProblemDetails = useCallback(async (problemId: number) => {
        setIsDetailsLoading(true)
        setDetailsError(null)

        try {
            const response = await getProblemById(problemId)
            setSelectedProblem(response)
            setEditTitle(response.title)
            setEditDescription(response.description)
            setEditDifficulty(response.difficulty)
            setEditTopic(response.topic)
            setEditClassId(response.class_id ?? '')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load problem details'
            setDetailsError(message)
            setSelectedProblem(null)
        } finally {
            setIsDetailsLoading(false)
        }
    }, [])

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
        void loadProblems()
    }, [loadProblems])

    useEffect(() => {
        if (!selectedProblemId) {
            setSelectedProblem(null)
            setDetailsError(null)
            setIsDetailsLoading(false)
            return
        }

        void loadProblemDetails(selectedProblemId)
    }, [loadProblemDetails, selectedProblemId])

    const handleUpdate = async () => {
        if (!selectedProblemId) {
            return
        }

        setActionMessage(null)
        setActionError(null)

        try {
            await updateProblem(selectedProblemId, {
                title: editTitle.trim() || undefined,
                description: editDescription.trim() || undefined,
                difficulty: editDifficulty,
                topic: editTopic.trim() || undefined,
                class_id: editClassId ? Number(editClassId) : undefined,
            })
            setActionMessage('Question updated.')
            await loadProblems()
            await loadProblemDetails(selectedProblemId)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update question'
            setActionError(message)
        }
    }

    const handleDelete = async () => {
        if (!selectedProblemId) {
            return
        }

        const confirmed = window.confirm('Delete this question? This cannot be undone.')
        if (!confirmed) {
            return
        }

        setActionMessage(null)
        setActionError(null)

        try {
            await deleteProblem(selectedProblemId)
            setActionMessage('Question deleted.')
            setSelectedProblemId(null)
            setSelectedProblem(null)
            await loadProblems()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete question'
            setActionError(message)
        }
    }

    return (
        <InstructorLayout
            currentPage="question-bank"
            title="Question Bank"
            subtitle="Manage your authored questions with preview, edit, and delete tools."
        >
            <div className="space-y-4">
                <section className="rounded-xl border border-border bg-card p-4">
                    <h1 className="text-2xl font-semibold text-foreground">Problems</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Data source: GET /problems/ filtered to your authored questions.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => void loadProblems()}
                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
                        >
                            Refresh
                        </button>
                        {actionMessage ? <span className="text-xs text-emerald-300">{actionMessage}</span> : null}
                        {actionError ? <span className="text-xs text-red-300">{actionError}</span> : null}
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
                    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="mb-3 text-sm text-muted-foreground">Total loaded: {problems.length}</div>
                            <div className="space-y-3">
                                {problems.map((problem) => (
                                    <button
                                        key={problem.id}
                                        type="button"
                                        onClick={() => setSelectedProblemId(problem.id)}
                                        className={[
                                            'w-full rounded-lg border p-4 text-left transition-colors',
                                            selectedProblemId === problem.id
                                                ? 'border-primary/60 bg-primary/10'
                                                : 'border-border bg-background hover:border-primary/40 hover:bg-secondary/30',
                                        ].join(' ')}
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
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4">
                            <h2 className="text-lg font-semibold text-foreground">Preview & edit</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Select a question to review and update details.
                            </p>

                            {!selectedProblemId ? (
                                <p className="mt-4 text-sm text-muted-foreground">No question selected.</p>
                            ) : null}

                            {isDetailsLoading ? (
                                <p className="mt-4 text-sm text-muted-foreground">Loading question details...</p>
                            ) : null}

                            {detailsError ? <p className="mt-4 text-sm text-red-300">{detailsError}</p> : null}

                            {selectedProblem ? (
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Title
                                        </label>
                                        <input
                                            value={editTitle}
                                            onChange={(event) => setEditTitle(event.target.value)}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Description
                                        </label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(event) => setEditDescription(event.target.value)}
                                            rows={6}
                                            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Difficulty
                                            </label>
                                            <select
                                                value={editDifficulty}
                                                onChange={(event) => setEditDifficulty(event.target.value as ProblemDifficulty)}
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Topic
                                            </label>
                                            <input
                                                value={editTopic}
                                                onChange={(event) => setEditTopic(event.target.value)}
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Class
                                        </label>
                                        <select
                                            value={editClassId}
                                            onChange={(event) =>
                                                setEditClassId(event.target.value ? Number(event.target.value) : '')
                                            }
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                        >
                                            <option value="">No class</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void handleUpdate()}
                                            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                                        >
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/code-lab?problemId=${selectedProblem.id}`)}
                                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
                                        >
                                            Open in Code Lab
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleDelete()}
                                            className="text-sm text-red-300 hover:text-red-200"
                                        >
                                            Delete question
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}
            </div>
        </InstructorLayout>
    )
}
