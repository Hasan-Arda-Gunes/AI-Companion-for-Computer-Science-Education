import { getAuthToken } from '../../auth/storage/authStorage'
import type {
    AddStudentToClassRequest,
    AddStudentToClassResponse,
    ClassDetails,
    ClassSummary,
    CreateClassRequest,
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

export async function listMyClasses() {
    const response = await fetch(`${API_BASE_URL}/classes/`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to load classes')
    }

    return (await response.json()) as ClassSummary[]
}

export async function getClassDetails(classId: number) {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to load class details')
    }

    return (await response.json()) as ClassDetails
}

export async function createClass(payload: CreateClassRequest) {
    const response = await fetch(`${API_BASE_URL}/classes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to create class')
    }

    return (await response.json()) as ClassSummary
}

export async function addStudentToClass(classId: number, payload: AddStudentToClassRequest) {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to add student to class')
    }

    return (await response.json()) as AddStudentToClassResponse
}

export async function removeStudentFromClass(classId: number, studentId: number) {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to remove student from class')
    }
}

export async function deleteClass(classId: number) {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    })

    if (!response.ok) {
        const apiError = (await parseJsonSafe(response)) as { detail?: string } | null
        throw new Error(apiError?.detail ?? 'Failed to delete class')
    }
}
