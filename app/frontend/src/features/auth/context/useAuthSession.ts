import { useContext, useMemo } from 'react'
import { AuthSessionContext } from './AuthSessionContext'
import { ROLES } from '../constants'
import { roleHasPermission, roleHasAllPermissions, roleHasAnyPermission } from '../permissions'
import type { Permission } from '../constants'

export function useAuthSession() {
    const context = useContext(AuthSessionContext)

    if (!context) {
        throw new Error('useAuthSession must be used inside AuthSessionProvider')
    }

    // Derive convenience methods from context
    const authSession = useMemo(
        () => ({
            ...context,
            // Role checkers
            isStudent: context.user?.role === ROLES.STUDENT,
            isTeacher: context.user?.role === ROLES.TEACHER,
            
            // Permission checkers
            hasPermission: (permission: Permission): boolean => {
                if (!context.user) return false
                return roleHasPermission(context.user.role, permission)
            },
            hasAllPermissions: (permissions: Permission[]): boolean => {
                if (!context.user) return false
                return roleHasAllPermissions(context.user.role, permissions)
            },
            hasAnyPermission: (permissions: Permission[]): boolean => {
                if (!context.user) return false
                return roleHasAnyPermission(context.user.role, permissions)
            },
        }),
        [context],
    )

    return authSession
}

