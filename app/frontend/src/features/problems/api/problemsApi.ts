import { getAuthToken } from '../../auth/storage/authStorage'
import type {
    CreateProblemRequest,
    CreateProblemResponse,
    ListProblemsParams,
    ListProblemsResponse,
    ProblemDetails,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function parseJsonSafe(response: Response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

function buildListProblemsQuery(params: ListProblemsParams = {}) {
    const searchParams = new URLSearchParams()

    if (params.page !== undefined) {
        searchParams.set('page', String(params.page))
    }
    if (params.page_size !== undefined) {
        searchParams.set('page_size', String(params.page_size))
    }
    if (params.difficulty) {
        searchParams.set('difficulty', params.difficulty)
    }
    if (params.topic) {
        searchParams.set('topic', params.topic)
    }
    if (params.search) {
        searchParams.set('search', params.search)
    }

    const query = searchParams.toString()
    return query ? `?${query}` : ''
}

export async function listProblems(params: ListProblemsParams = {}) {
    const { accessToken, tokenType } = getAuthToken()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/problems/${buildListProblemsQuery(params)}`, {
        method: 'GET',
        headers: {
            Authorization: `${tokenType} ${accessToken}`,
        },
    })

    if (!response.ok) {
        const payload = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(payload?.detail ?? 'Failed to load problems')
    }

    return (await response.json()) as ListProblemsResponse
}

export async function createProblem(payload: CreateProblemRequest) {
    const { accessToken, tokenType } = getAuthToken()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/problems/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${tokenType} ${accessToken}`,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to create problem')
    }

    return (await response.json()) as CreateProblemResponse
}

export async function getProblemById(problemId: number) {
    const { accessToken, tokenType } = getAuthToken()

    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
        method: 'GET',
        headers: {
            Authorization: `${tokenType} ${accessToken}`,
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to load problem details')
    }

    return (await response.json()) as ProblemDetails
}
