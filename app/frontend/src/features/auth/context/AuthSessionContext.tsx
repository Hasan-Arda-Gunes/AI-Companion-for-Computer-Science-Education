import type { ReactNode } from 'react'
import { createContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/authApi'
import { clearAuthToken, getAuthToken } from '../storage/authStorage'
import type { User } from '../types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthSessionContextValue = {
    status: AuthStatus
    user: User | null
    isAuthenticated: boolean
    refreshSession: () => Promise<void>
    signOut: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined)
export { AuthSessionContext }

type AuthSessionProviderProps = {
    children: ReactNode
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
    const initialToken = getAuthToken().accessToken
    const initialStatus: AuthStatus = initialToken ? 'loading' : 'unauthenticated'

    const [status, setStatus] = useState<AuthStatus>(initialStatus)
    const [user, setUser] = useState<User | null>(null)

    const refreshSession = async () => {
        const { accessToken, tokenType } = getAuthToken()

        if (!accessToken) {
            setUser(null)
            setStatus('unauthenticated')
            return
        }

        setStatus('loading')

        try {
            const me = await getCurrentUser(accessToken, tokenType)
            setUser(me)
            setStatus('authenticated')
        } catch {
            clearAuthToken()
            setUser(null)
            setStatus('unauthenticated')
        }
    }

    const signOut = () => {
        clearAuthToken()
        setUser(null)
        setStatus('unauthenticated')
    }

    useEffect(() => {
        if (!initialToken) {
            return
        }

        const bootstrap = async () => {
            const { accessToken, tokenType } = getAuthToken()
            if (!accessToken) {
                setUser(null)
                setStatus('unauthenticated')
                return
            }

            try {
                const me = await getCurrentUser(accessToken, tokenType)
                setUser(me)
                setStatus('authenticated')
            } catch {
                clearAuthToken()
                setUser(null)
                setStatus('unauthenticated')
            }
        }

        void bootstrap()
    }, [initialToken])

    const value = useMemo<AuthSessionContextValue>(
        () => ({
            status,
            user,
            isAuthenticated: status === 'authenticated',
            refreshSession,
            signOut,
        }),
        [status, user],
    )

    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
