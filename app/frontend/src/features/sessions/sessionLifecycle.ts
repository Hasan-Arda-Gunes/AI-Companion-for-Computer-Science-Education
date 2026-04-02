import { completeSession } from './api/sessionsApi'
import type { ActiveLearningSession } from './types'

const ACTIVE_LEARNING_SESSION_STORAGE_KEY = 'codelab.activeLearningSession'

export function getActiveLearningSession() {
    if (typeof window === 'undefined') {
        return null
    }

    const raw = window.localStorage.getItem(ACTIVE_LEARNING_SESSION_STORAGE_KEY)
    if (!raw) {
        return null
    }

    try {
        const parsed = JSON.parse(raw) as Partial<ActiveLearningSession>
        if (!parsed.id || !parsed.problemId) {
            return null
        }

        return {
            id: parsed.id,
            problemId: parsed.problemId,
            bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
        } as ActiveLearningSession
    } catch {
        return null
    }
}

export function setActiveLearningSession(session: ActiveLearningSession) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(ACTIVE_LEARNING_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearActiveLearningSession() {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.removeItem(ACTIVE_LEARNING_SESSION_STORAGE_KEY)
}

export async function completeAndClearActiveLearningSession(keepalive = false) {
    const activeSession = getActiveLearningSession()
    if (!activeSession) {
        return
    }

    try {
        await completeSession(activeSession.id, { final_score: activeSession.bestScore ?? 0 }, keepalive)
    } catch {
        // Best-effort cleanup flow; ignore completion errors during logout/unload.
    } finally {
        clearActiveLearningSession()
    }
}
