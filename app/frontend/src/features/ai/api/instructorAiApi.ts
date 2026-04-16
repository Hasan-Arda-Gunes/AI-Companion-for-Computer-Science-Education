/**
 * Instructor AI API functions with multi-LLM provider support
 */
import { getAuthToken } from '../../auth/storage/authStorage'
import type {
    GenerateQuestionVariationRequest,
    GenerateQuestionFromStyleRequest,
    GenerateQuestionFromConstraintsRequest,
    EvaluateQuestionRequest,
    EvaluateQuestionResponse,
    GenerateTestCasesRequest,
    GenerateTestCasesResponse,
    EvaluateTestCasesRequest,
    EvaluateTestCasesResponse,
    InstructorChatRequest,
    InstructorChatResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function parseJsonSafe(response: Response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

function getAuthHeader() {
    const { accessToken, tokenType } = getAuthToken()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    return {
        Authorization: `${tokenType} ${accessToken}`,
    }
}

/**
 * Generate a question from variation of existing question(s)
 * Create a new question based on one or more existing questions with variations
 */
export async function generateQuestionFromVariation(payload: GenerateQuestionVariationRequest) {
    const response = await fetch(`${API_BASE_URL}/ai-problems/variations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to generate question variation')
    }

    return (await response.json()) as { problem_id: number; title: string; description: string }
}

/**
 * Generate a question in similar style but different topic
 * Create a new question inspired by existing one(s) but for a different topic
 */
export async function generateQuestionFromStyle(payload: GenerateQuestionFromStyleRequest) {
    const response = await fetch(`${API_BASE_URL}/ai-problems/similar-style`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to generate question in similar style')
    }

    return (await response.json()) as { problem_id: number; title: string; description: string }
}

/**
 * Generate a question from constraints and topics
 * Create a new question based on given constraints and topics
 */
export async function generateQuestionFromConstraints(payload: GenerateQuestionFromConstraintsRequest) {
    const response = await fetch(`${API_BASE_URL}/ai-problems/from-constraints`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to generate question from constraints')
    }

    return (await response.json()) as { problem_id: number; title: string; description: string }
}

/**
 * Evaluate a question for clarity, completeness, and testability
 * Get AI feedback on the quality of a question
 */
export async function evaluateQuestion(payload: EvaluateQuestionRequest) {
    const response = await fetch(`${API_BASE_URL}/ai-problems/evaluate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to evaluate question')
    }

    return (await response.json()) as EvaluateQuestionResponse
}

/**
 * Generate test cases for a question
 * Create comprehensive test cases based on question description and constraints
 */
export async function generateTestCases(payload: GenerateTestCasesRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/test-cases/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to generate test cases')
    }

    return (await response.json()) as GenerateTestCasesResponse
}

/**
 * Evaluate test cases for coverage and edge case handling
 * Get AI feedback on the quality of test cases
 */
export async function evaluateTestCases(payload: EvaluateTestCasesRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/test-cases/evaluate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to evaluate test cases')
    }

    return (await response.json()) as EvaluateTestCasesResponse
}

/**
 * Chat with AI for instructor assistance
 * Get help with question creation, refinement, and testing
 */
export async function instructorChat(payload: InstructorChatRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/instructor-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to chat with AI')
    }

    return (await response.json()) as InstructorChatResponse
}
