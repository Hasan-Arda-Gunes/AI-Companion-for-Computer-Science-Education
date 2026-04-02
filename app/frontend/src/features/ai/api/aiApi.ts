import { getAuthToken } from '../../auth/storage/authStorage'
import type {
    ChatWithAiRequest,
    ChatWithAiResponse,
    ExplainErrorRequest,
    ExplainErrorResponse,
    RequestHintRequest,
    RequestHintResponse,
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

export async function requestHint(payload: RequestHintRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/hint`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to request hint')
    }

    return (await response.json()) as RequestHintResponse
}

export async function chatWithAi(payload: ChatWithAiRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
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

    return (await response.json()) as ChatWithAiResponse
}

export async function explainError(payload: ExplainErrorRequest) {
    const response = await fetch(`${API_BASE_URL}/ai/explain-error`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to explain error')
    }

    return (await response.json()) as ExplainErrorResponse
}
