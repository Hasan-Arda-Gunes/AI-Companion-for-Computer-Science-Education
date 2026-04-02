import { getAuthToken } from '../../auth/storage/authStorage'
import type { SubmissionDetails, SubmitCodeRequest, SubmitCodeResponse } from '../types'

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

export async function submitCode(payload: SubmitCodeRequest) {
    const response = await fetch(`${API_BASE_URL}/submissions/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to submit code')
    }

    return (await response.json()) as SubmitCodeResponse
}

export async function getSubmission(submissionId: number) {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to load submission')
    }

    return (await response.json()) as SubmissionDetails
}
