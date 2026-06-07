import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function parseJsonSafe(response: Response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
        ...init,
    })

    if (!response.ok) {
        const payload = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(payload?.detail ?? 'Request failed')
    }

    return (await response.json()) as T
}

export async function registerUser(payload: RegisterRequest) {
    return request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function loginUser(payload: LoginRequest) {
    return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function getCurrentUser(accessToken: string, tokenType = 'bearer') {
    return request<User>('/auth/me', {
        method: 'GET',
        headers: {
            Authorization: `${tokenType} ${accessToken}`,
        },
    })
}
