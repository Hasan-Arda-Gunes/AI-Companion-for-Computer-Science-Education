import type { ReactNode } from 'react'
import { AuthSessionProvider } from '../features/auth/context/AuthSessionContext'

type AppProviderProps = {
    children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
    return (
        <AuthSessionProvider>
            <div className="min-h-screen bg-background text-foreground">{children}</div>
        </AuthSessionProvider>
    )
}
