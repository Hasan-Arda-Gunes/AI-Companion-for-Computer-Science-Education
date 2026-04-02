import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSession } from '../../features/auth/context/useAuthSession'

type GuardProps = {
    children: ReactNode
}

function AuthBootstrappingScreen() {
    return (
        <div className="grid min-h-screen place-items-center bg-background text-foreground">
            <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
    )
}

export function ProtectedRoute({ children }: GuardProps) {
    const { status, isAuthenticated } = useAuthSession()

    if (status === 'loading') {
        return <AuthBootstrappingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export function PublicOnlyRoute({ children }: GuardProps) {
    const { status, isAuthenticated } = useAuthSession()

    if (status === 'loading') {
        return <AuthBootstrappingScreen />
    }

    if (isAuthenticated) {
        return <Navigate to="/student/dashboard" replace />
    }

    return <>{children}</>
}
