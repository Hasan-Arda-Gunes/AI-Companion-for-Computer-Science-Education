export type ProblemDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ProblemExample = {
    input: unknown
    expected_output: unknown
}

export type ProblemTestCase = {
    id: string
    input: unknown
    expected_output: unknown
    function_name: string
}

export type ProblemEvaluationCriteria = {
    check_correctness: boolean
    check_efficiency: boolean
}

export type Problem = {
    id: number
    title: string
    description: string
    difficulty: ProblemDifficulty
    topic: string
    created_by?: number
        class_id?: number
    examples: ProblemExample[]
    starter_code: string
    hints: string[]
    created_at: string
}

export type ProblemDetails = {
    id: number
    title: string
    description: string
    difficulty: ProblemDifficulty
    topic: string
    created_by?: number
        class_id?: number
    constraints?: Record<string, unknown>
    examples?: Array<{
        input: unknown
        expected_output: unknown
    }>
    starter_code?: string
    hints?: string[]
    learning_objectives?: string[]
    related_concepts?: string[]
}

export type ListProblemsParams = {
    page?: number
    page_size?: number
    difficulty?: ProblemDifficulty
    topic?: string
    search?: string
        class_id?: number
}

export type ListProblemsResponse = {
    problems: Problem[]
    total: number
    page: number
    page_size: number
}

export type CreateProblemRequest = {
    title: string
    description: string
    difficulty: ProblemDifficulty
    topic: string
        class_id?: number
    examples: ProblemExample[]
    test_cases: ProblemTestCase[]
    starter_code: string
    evaluation_criteria: ProblemEvaluationCriteria
    hints: string[]
    time_limit: number
    memory_limit: number
}

export type CreateProblemResponse = Problem

export type UpdateProblemRequest = {
    title?: string
    description?: string
    difficulty?: ProblemDifficulty
    topic?: string
        class_id?: number
    constraints?: Record<string, unknown>
    examples?: ProblemExample[]
    test_cases?: ProblemTestCase[]
    starter_code?: string
    is_active?: boolean
}
