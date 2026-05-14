/**
 * Permission utility functions for evaluating role-based access.
 */

import type { UserRole } from './types'
import { ROLE_PERMISSIONS, type Permission } from './constants'

/**
 * Checks if a given role has a specific permission.
 * @param role - The user role to check
 * @param permission - The permission to verify
 * @returns true if the role has the permission, false otherwise
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    return permissions?.includes(permission) ?? false
}

/**
 * Gets all permissions for a given role.
 * @param role - The user role
 * @returns Array of permissions for that role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Checks if a role has ALL of the specified permissions.
 * @param role - The user role
 * @param permissions - Permissions to check (all must be present)
 * @returns true if role has all permissions
 */
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => roleHasPermission(role, permission))
}

/**
 * Checks if a role has ANY of the specified permissions.
 * @param role - The user role
 * @param permissions - Permissions to check (any can be present)
 * @returns true if role has at least one permission
 */
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => roleHasPermission(role, permission))
}
