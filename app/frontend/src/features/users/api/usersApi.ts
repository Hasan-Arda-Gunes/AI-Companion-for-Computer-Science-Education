import { getAuthToken } from '../../auth/storage/authStorage'
import type { User } from '../../auth/types'

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

export async function getUserById(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? `User with ID ${userId} not found`)
    }

    return (await response.json()) as User
}

export async function getUserByUsername(username: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? `User with username '${username}' not found`)
    }

    return (await response.json()) as User
}

export async function searchUsersByPartialUsername(usernamePart: string, limit = 10): Promise<User[]> {
    const searchParams = new URLSearchParams()
    searchParams.set('username_part', usernamePart)
    searchParams.set('limit', String(limit))

    const response = await fetch(`${API_BASE_URL}/users/search/by-partial-username?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to search users')
    }

    return (await response.json()) as User[]
}
