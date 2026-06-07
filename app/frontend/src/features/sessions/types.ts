export type LearningSession = {
    id: number
    problem_id: number
    started_at?: string
    is_completed?: boolean
    attempts_count?: number
}

export type CompleteSessionRequest = {
    final_score: number
}

export type ActiveLearningSession = {
    id: number
    problemId: number
    bestScore: number
}
