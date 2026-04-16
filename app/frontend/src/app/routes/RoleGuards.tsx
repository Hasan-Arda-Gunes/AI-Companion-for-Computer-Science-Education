/**
 * Role and permission-based route guards and conditional renderers.
 * Used to enforce role access control at the route and component level.
 */

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSession } from '../../features/auth/context/useAuthSession'
import type { Permission } from '../../features/auth/constants'
import type { UserRole } from '../../features/auth/types'

type RoleBasedRouteProps = {
    children: ReactNode
    requiredRoles: UserRole[]
    fallbackPath?: string
}

/**
 * Route guard that checks if user has one of the required roles.
 * Redirects to fallback path if role does not match.
 * 
 * Example:
 * ```tsx
 * <Route path="/teacher/create" element={
 *   <RoleBasedRoute requiredRoles={['teacher']}>
 *     <CreateQuestionPage />
 *   </RoleBasedRoute>
 * } />
 * ```
 */
export function RoleBasedRoute({
    children,
    requiredRoles,
    fallbackPath = '/unauthorized',
}: RoleBasedRouteProps) {
    const { user } = useAuthSession()

    if (!user || !requiredRoles.includes(user.role)) {
        return <Navigate to={fallbackPath} replace />
    }

    return <>{children}</>
}

type PermissionBasedRouteProps = {
    children: ReactNode
    requiredPermissions: Permission[]
    requireAll?: boolean
    fallbackPath?: string
}

/**
 * Route guard that checks if user has specific permissions.
 * By default checks for ANY permission (requireAll=false).
 * Set requireAll=true to require ALL permissions.
 * 
 * Example:
 * ```tsx
 * <Route path="/teacher/analytics" element={
 *   <PermissionBasedRoute requiredPermissions={['view_analytics']}>
 *     <AnalyticsPage />
 *   </PermissionBasedRoute>
 * } />
 * ```
 */
export function PermissionBasedRoute({
    children,
    requiredPermissions,
    requireAll = false,
    fallbackPath = '/unauthorized',
}: PermissionBasedRouteProps) {
    const { hasAllPermissions, hasAnyPermission } = useAuthSession()

    const hasRequiredPermissions = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions)

    if (!hasRequiredPermissions) {
        return <Navigate to={fallbackPath} replace />
    }

    return <>{children}</>
}

type RoleBasedRenderProps = {
    children: ReactNode
    requiredRoles: UserRole[]
}

/**
 * Conditional renderer that only shows children if user has one of the required roles.
 * Renders nothing (null) if role does not match.
 * 
 * Example:
 * ```tsx
 * <RoleBasedRender requiredRoles={['teacher']}>
 *   <TeacherOnlyButton />
 * </RoleBasedRender>
 * ```
 */
export function RoleBasedRender({ children, requiredRoles }: RoleBasedRenderProps) {
    const { user } = useAuthSession()

    if (!user || !requiredRoles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}

type PermissionBasedRenderProps = {
    children: ReactNode
    requiredPermissions: Permission[]
    requireAll?: boolean
}

/**
 * Conditional renderer that only shows children if user has specific permissions.
 * Renders nothing (null) if permissions do not match.
 * 
 * Example:
 * ```tsx
 * <PermissionBasedRender requiredPermissions={['view_analytics']}>
 *   <AnalyticsWidget />
 * </PermissionBasedRender>
 * ```
 */
export function PermissionBasedRender({
    children,
    requiredPermissions,
    requireAll = false,
}: PermissionBasedRenderProps) {
    const { hasAllPermissions, hasAnyPermission } = useAuthSession()

    const hasRequiredPermissions = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions)

    if (!hasRequiredPermissions) {
        return null
    }

    return <>{children}</>
}
