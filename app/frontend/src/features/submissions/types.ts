import type { LLMProvider } from '../ai/types'

export type SubmissionStatus = 'pending' | 'running' | 'correct' | 'incorrect' | 'partial' | 'error'

export type SubmitCodeRequest = {
    problem_id: number
    code: string
    language: string
    session_id: number
    provider?: LLMProvider
}

export type SubmitCodeResponse = {
    id: number
    problem_id: number
    code: string
    language: string
    status: SubmissionStatus
    submitted_at: string
}

export type SubmissionTestResult = {
    test_id: string
    passed: boolean
    expected: unknown
    actual: unknown
}

export type SubmissionIssue = {
    type: string
    description: string
}

export type SubmissionAiFeedback = {
    overall_assessment?: string
    correctness_score?: number
    quality_score?: number
    efficiency_score?: number
    strengths?: string[]
    issues?: SubmissionIssue[]
    suggestions?: string[]
    next_steps?: string[]
}

export type SubmissionDetails = {
    id: number
    problem_id: number
    code: string
    language: string
    status: SubmissionStatus
    score?: number
    provider_used?: LLMProvider
    test_results?: SubmissionTestResult[]
    execution_time?: number
    ai_feedback?: SubmissionAiFeedback
    submitted_at?: string
    evaluated_at?: string
}
