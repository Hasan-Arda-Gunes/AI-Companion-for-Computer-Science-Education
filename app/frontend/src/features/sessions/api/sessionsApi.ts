import { getAuthToken } from '../../auth/storage/authStorage'
import type { CompleteSessionRequest, LearningSession } from '../types'

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

export async function startSession(problemId: number) {
    const response = await fetch(`${API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ problem_id: problemId }),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to start session')
    }

    return (await response.json()) as LearningSession
}

export async function completeSession(sessionId: number, payload: CompleteSessionRequest, keepalive = false) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
        keepalive,
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to complete session')
    }
}
