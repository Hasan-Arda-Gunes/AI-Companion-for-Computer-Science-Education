import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { ROLES } from '../../../features/auth/constants'

/**
 * Intermediate redirect page that routes users to their role-specific dashboard after login.
 * Students → /student/dashboard
 * Teachers → /instructor/dashboard
 */
export function AuthRedirectPage() {
    const location = useLocation()
    const { user, status } = useAuthSession()

    console.log('[AuthRedirectPage] Current location:', location.pathname)
    console.log('[AuthRedirectPage] Status:', status, 'User role:', user?.role)

    // Wait for user to be loaded (either from status or from context update)
    if (!user) {
        console.log('[AuthRedirectPage] No user data yet, waiting...')
        return (
            <div className="grid min-h-screen place-items-center bg-background text-foreground">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }

    console.log('[AuthRedirectPage] User loaded, role:', user.role, 'ROLES.TEACHER:', ROLES.TEACHER)

    // Route based on role - use strict equality check
    if (user.role === 'teacher') {
        console.log('[AuthRedirectPage] User role is teacher, redirecting to /instructor/dashboard')
        return <Navigate to="/instructor/dashboard" replace />
    }

    if (user.role === 'student') {
        console.log('[AuthRedirectPage] User role is student, redirecting to /student/dashboard')
        return <Navigate to="/student/dashboard" replace />
    }

    // Fallback
    console.log('[AuthRedirectPage] Unknown role:', user.role, 'redirecting to /student/dashboard')
    return <Navigate to="/student/dashboard" replace />
}
