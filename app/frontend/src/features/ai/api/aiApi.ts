import { getAuthToken } from '../../auth/storage/authStorage'
import type {
    ChatWithAiRequest,
    ChatWithAiResponse,
    ExplainErrorRequest,
    ExplainErrorResponse,
    InstructorChatRequest,
    InstructorChatResponse,
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
    const url = new URL(`${API_BASE_URL}/ai/hint`)
    if (payload.provider) {
        url.searchParams.set('provider', payload.provider)
    }

    const response = await fetch(url.toString(), {
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
    const url = new URL(`${API_BASE_URL}/ai/chat`)
    if (payload.provider) {
        url.searchParams.set('provider', payload.provider)
    }

    const response = await fetch(url.toString(), {
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
    const url = new URL(`${API_BASE_URL}/ai/explain-error`)
    if (payload.provider) {
        url.searchParams.set('provider', payload.provider)
    }

    const response = await fetch(url.toString(), {
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

export async function instructorChat(payload: InstructorChatRequest) {
    const url = new URL(`${API_BASE_URL}/ai/chat`)
    if (payload.provider) {
        url.searchParams.set('provider', payload.provider)
    }

    const response = await fetch(url.toString(), {
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
