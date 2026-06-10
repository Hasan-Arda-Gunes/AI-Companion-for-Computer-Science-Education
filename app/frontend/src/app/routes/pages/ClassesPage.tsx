import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { RoleAwareSidebar } from '../../../components/layout/RoleAwareSidebar'
import { defaultInstructorSidebarPagePathMap } from '../../../components/layout/instructorSidebarConfig'
import { defaultStudentSidebarPagePathMap } from '../../../components/layout/studentSidebarConfig'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { completeAndClearActiveLearningSession } from '../../../features/sessions/sessionLifecycle'
import {
    addStudentToClass,
    createClass,
    deleteClass,
    getClassDetails,
    listMyClasses,
    removeStudentFromClass,
} from '../../../features/classes/api/classesApi'
import type { ClassDetails, ClassSummary } from '../../../features/classes/types'
import { getUserById, getUserByUsername, searchUsersByPartialUsername } from '../../../features/users/api/usersApi'
import type { User } from '../../../features/auth/types'

export function ClassesPage() {
    const navigate = useNavigate()
    const { user, signOut } = useAuthSession()
    const isTeacher = user?.role === 'teacher'

    const [classes, setClasses] = useState<ClassSummary[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [selectedDetails, setSelectedDetails] = useState<ClassDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDetailsLoading, setIsDetailsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [actionMessage, setActionMessage] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const [newClassName, setNewClassName] = useState('')
    const [newClassDescription, setNewClassDescription] = useState('')
    const [studentSearchInput, setStudentSearchInput] = useState('')
    const [suggestions, setSuggestions] = useState<User[]>([])
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null)

    useEffect(() => {
        const query = studentSearchInput.trim()
        if (!query) {
            setSuggestions([])
            setIsSearchingSuggestions(false)
            return
        }

        if (selectedStudent && (selectedStudent.username === query || `${selectedStudent.full_name} (${selectedStudent.username})` === query)) {
            return
        }

        const fetchSuggestions = async () => {
            setIsSearchingSuggestions(true)
            try {
                const results: User[] = []
                
                const parsedId = Number(query)
                if (Number.isInteger(parsedId) && parsedId > 0) {
                    try {
                        const userById = await getUserById(parsedId)
                        if (userById && userById.role === 'student') {
                            results.push(userById)
                        }
                    } catch {
                        // User not found by ID
                    }
                }

                const partialUsers = await searchUsersByPartialUsername(query)
                for (const u of partialUsers) {
                    if (u.role === 'student' && !results.some(r => r.id === u.id)) {
                        results.push(u)
                    }
                }

                const enrolledStudentIds = new Set(selectedDetails?.students.map(s => s.id) ?? [])
                const unenrolledStudents = results.filter(u => !enrolledStudentIds.has(u.id))

                setSuggestions(unenrolledStudents)
            } catch {
                setSuggestions([])
            } finally {
                setIsSearchingSuggestions(false)
            }
        }

        const timer = setTimeout(() => {
            void fetchSuggestions()
        }, 300)

        return () => clearTimeout(timer)
    }, [studentSearchInput, selectedDetails, selectedStudent])

    useEffect(() => {
        const handleDocumentClick = () => {
            setShowSuggestions(false)
        }
        document.addEventListener('click', handleDocumentClick)
        return () => {
            document.removeEventListener('click', handleDocumentClick)
        }
    }, [])

    useEffect(() => {
        const handleBeforeUnload = () => {
            void completeAndClearActiveLearningSession(true)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    const pagePathMap = isTeacher
        ? defaultInstructorSidebarPagePathMap
        : defaultStudentSidebarPagePathMap

    const selectedClassSummary = useMemo(
        () => classes.find((item) => item.id === selectedClassId) ?? null,
        [classes, selectedClassId],
    )

    const loadClasses = async () => {
        setIsLoading(true)
        setErrorMessage(null)
        setActionMessage(null)

        try {
            const response = await listMyClasses()
            setClasses(response)

            if (selectedClassId && !response.some((item) => item.id === selectedClassId)) {
                setSelectedClassId(null)
                setSelectedDetails(null)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load classes'
            setErrorMessage(message)
        } finally {
            setIsLoading(false)
        }
    }

    const loadClassDetails = async (classId: number) => {
        setIsDetailsLoading(true)
        setDetailsError(null)

        try {
            const response = await getClassDetails(classId)
            setSelectedDetails(response)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load class details'
            setDetailsError(message)
            setSelectedDetails(null)
        } finally {
            setIsDetailsLoading(false)
        }
    }

    useEffect(() => {
        void loadClasses()
    }, [])

    useEffect(() => {
        if (!selectedClassId || !isTeacher) {
            setSelectedDetails(null)
            setDetailsError(null)
            setIsDetailsLoading(false)
            return
        }

        void loadClassDetails(selectedClassId)
    }, [selectedClassId, isTeacher])

    const handleCreateClass = async () => {
        setActionMessage(null)
        setActionError(null)

        if (!newClassName.trim() || !newClassDescription.trim()) {
            setActionError('Class name and description are required.')
            return
        }

        try {
            const created = await createClass({
                name: newClassName.trim(),
                description: newClassDescription.trim(),
            })
            setNewClassName('')
            setNewClassDescription('')
            setActionMessage(`Created class "${created.name}".`)
            await loadClasses()
            setSelectedClassId(created.id)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create class'
            setActionError(message)
        }
    }

    const handleAddStudent = async () => {
        setActionMessage(null)
        setActionError(null)

        if (!selectedClassId) {
            setActionError('Select a class first.')
            return
        }

        const query = studentSearchInput.trim()
        if (!query) {
            setActionError('Please enter a student username or ID.')
            return
        }

        let studentId: number | null = null
        let studentLabel = ''

        try {
            if (selectedStudent) {
                studentId = selectedStudent.id
                studentLabel = selectedStudent.username
            } else {
                const parsedId = Number(query)
                if (Number.isInteger(parsedId) && parsedId > 0) {
                    const studentUser = await getUserById(parsedId)
                    if (studentUser.role !== 'student') {
                        setActionError('Only users with student role can be added to a class.')
                        return
                    }
                    studentId = studentUser.id
                    studentLabel = studentUser.username
                } else {
                    const studentUser = await getUserByUsername(query)
                    if (studentUser.role !== 'student') {
                        setActionError('Only users with student role can be added to a class.')
                        return
                    }
                    studentId = studentUser.id
                    studentLabel = studentUser.username
                }
            }

            if (!studentId) {
                setActionError('Could not find student.')
                return
            }

            await addStudentToClass(selectedClassId, { student_id: studentId })
            setStudentSearchInput('')
            setSelectedStudent(null)
            setActionMessage(`Added student "${studentLabel}" to class.`)
            await loadClassDetails(selectedClassId)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add student'
            setActionError(message)
        }
    }

    const handleRemoveStudent = async (studentId: number) => {
        if (!selectedClassId) {
            return
        }

        setActionMessage(null)
        setActionError(null)

        try {
            await removeStudentFromClass(selectedClassId, studentId)
            setActionMessage(`Removed student #${studentId}.`)
            await loadClassDetails(selectedClassId)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to remove student'
            setActionError(message)
        }
    }

    const handleDeleteClass = async () => {
        if (!selectedClassId) {
            return
        }

        const confirmed = window.confirm('Delete this class? This cannot be undone.')
        if (!confirmed) {
            return
        }

        setActionMessage(null)
        setActionError(null)

        try {
            await deleteClass(selectedClassId)
            setActionMessage('Class deleted.')
            setSelectedClassId(null)
            setSelectedDetails(null)
            await loadClasses()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete class'
            setActionError(message)
        }
    }

    return (
        <DashboardLayout
            title="Classes"
            subtitle="Review enrolled classes, manage rosters, and keep sessions organized."
            showHeader={false}
            sidebar={
                <RoleAwareSidebar
                    className="hidden lg:flex"
                    currentPage="classes"
                    onNavigate={(page) => {
                        const path = pagePathMap[page]
                        if (path) {
                            navigate(path)
                        }
                    }}
                    onLogout={() => {
                        void completeAndClearActiveLearningSession()
                        signOut()
                        navigate('/login', { replace: true })
                    }}
                />
            }
        >
            <div className="space-y-6">
                <section className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">My Classes</h2>
                            <p className="text-sm text-muted-foreground">
                                {isTeacher
                                    ? 'Manage your course roster and enrollments.'
                                    : 'View the classes you are enrolled in.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void loadClasses()}
                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                {errorMessage ? (
                    <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                        {errorMessage}
                    </section>
                ) : null}

                {actionMessage ? (
                    <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        {actionMessage}
                    </section>
                ) : null}

                {actionError ? (
                    <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                        {actionError}
                    </section>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-xl border border-border bg-card p-4">
                        <div className="mb-3 text-sm text-muted-foreground">
                            {isLoading ? 'Loading classes...' : `Total: ${classes.length}`}
                        </div>
                        <div className="space-y-3">
                            {classes.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedClassId(item.id)}
                                    className={[
                                        'w-full rounded-lg border p-4 text-left transition',
                                        selectedClassId === item.id
                                            ? 'border-primary/60 bg-primary/10'
                                            : 'border-border bg-background hover:border-primary/40',
                                    ].join(' ')}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-base font-medium text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                                            {item.student_count} students
                                        </span>
                                    </div>
                                </button>
                            ))}

                            {!isLoading && classes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No classes found.</p>
                            ) : null}
                        </div>
                    </section>

                    <section className="space-y-4">
                        {isTeacher ? (
                            <article className="rounded-xl border border-border bg-card p-4">
                                <h3 className="text-base font-semibold text-foreground">Create a class</h3>
                                <div className="mt-3 space-y-3">
                                    <input
                                        value={newClassName}
                                        onChange={(event) => setNewClassName(event.target.value)}
                                        placeholder="Class name"
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    />
                                    <textarea
                                        value={newClassDescription}
                                        onChange={(event) => setNewClassDescription(event.target.value)}
                                        placeholder="Class description"
                                        rows={3}
                                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handleCreateClass()}
                                        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                                    >
                                        Create Class
                                    </button>
                                </div>
                            </article>
                        ) : null}

                        <article className="rounded-xl border border-border bg-card p-4">
                            <h3 className="text-base font-semibold text-foreground">Class details</h3>

                            {!selectedClassId ? (
                                <p className="mt-3 text-sm text-muted-foreground">Select a class to view details.</p>
                            ) : null}

                            {selectedClassId && isTeacher ? (
                                <div className="mt-3 space-y-3">
                                    {isDetailsLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading class details...</p>
                                    ) : null}

                                    {detailsError ? (
                                        <p className="text-sm text-red-300">{detailsError}</p>
                                    ) : null}

                                    {selectedDetails ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-base font-medium text-foreground">{selectedDetails.name}</p>
                                                <p className="text-xs text-muted-foreground">{selectedDetails.description}</p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Created: {selectedDetails.created_at}
                                            </div>
                                        </div>
                                    ) : null}

                                    {selectedDetails ? (
                                        <div className="border-t border-border pt-3">
                                            <h4 className="text-sm font-semibold text-foreground">Add student</h4>
                                            <div 
                                                className="mt-2 flex items-center gap-2 relative"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="relative flex-1 min-w-45">
                                                    <input
                                                        value={studentSearchInput}
                                                        onChange={(event) => {
                                                            setStudentSearchInput(event.target.value)
                                                            setShowSuggestions(true)
                                                            setSelectedStudent(null)
                                                        }}
                                                        onFocus={() => setShowSuggestions(true)}
                                                        placeholder="Student username or ID"
                                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                    
                                                    {showSuggestions && studentSearchInput.trim() && (
                                                        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 rounded-md border border-border bg-card p-1 shadow-lg">
                                                            {isSearchingSuggestions ? (
                                                                <div className="px-3 py-2 text-xs text-muted-foreground">Searching students...</div>
                                                            ) : suggestions.length === 0 ? (
                                                                <div className="px-3 py-2 text-xs text-muted-foreground">No matching students found</div>
                                                            ) : (
                                                                suggestions.map((student) => (
                                                                    <button
                                                                        key={student.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setStudentSearchInput(`${student.full_name} (${student.username})`)
                                                                            setSelectedStudent(student)
                                                                            setShowSuggestions(false)
                                                                        }}
                                                                        className="w-full text-left rounded px-3 py-2 text-sm text-foreground hover:bg-secondary/40 transition-colors"
                                                                    >
                                                                        <div className="font-medium">{student.full_name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            @{student.username} • ID: {student.id}
                                                                        </div>
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleAddStudent()}
                                                    className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {selectedDetails ? (
                                        <div className="border-t border-border pt-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-foreground">Students</h4>
                                                <span className="text-xs text-muted-foreground">
                                                    {selectedDetails.student_count} total
                                                </span>
                                            </div>
                                            <div className="mt-2 space-y-2">
                                                {selectedDetails.students.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground">No students enrolled yet.</p>
                                                ) : null}
                                                {selectedDetails.students.map((student) => (
                                                    <div
                                                        key={student.id}
                                                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                                                    >
                                                        <div>
                                                            <p className="text-sm text-foreground">{student.full_name}</p>
                                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleRemoveStudent(student.id)}
                                                            className="text-xs text-red-300 hover:text-red-200"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {selectedDetails ? (
                                        <div className="border-t border-border pt-3">
                                            <button
                                                type="button"
                                                onClick={() => void handleDeleteClass()}
                                                className="text-sm text-red-300 hover:text-red-200"
                                            >
                                                Delete class
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {selectedClassId && !isTeacher && selectedClassSummary ? (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <p className="text-base font-medium text-foreground">{selectedClassSummary.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedClassSummary.description}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Students enrolled: {selectedClassSummary.student_count}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Student roster details are available to instructors.
                                    </p>
                                </div>
                            ) : null}
                        </article>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    )
}
