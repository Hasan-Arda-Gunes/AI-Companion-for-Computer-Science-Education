/**
 * Centralized role and permission constants.
 * Ensures consistent naming and prevents typos across the codebase.
 */

export const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
} as const

export type RoleKey = keyof typeof ROLES

/**
 * All available permissions in the system.
 * Used for feature-level gating and UI control.
 */
export const PERMISSIONS = {
    // Student permissions
    SUBMIT_CODE: 'submit_code',
    VIEW_OWN_SUBMISSIONS: 'view_own_submissions',
    VIEW_OWN_PROGRESS: 'view_own_progress',
    VIEW_LEADERBOARD: 'view_leaderboard',
    
    // Teacher permissions
    CREATE_PROBLEM: 'create_problem',
    UPDATE_OWN_PROBLEMS: 'update_own_problems',
    DELETE_OWN_PROBLEMS: 'delete_own_problems',
    VIEW_QUESTION_BANK: 'view_question_bank',
    VIEW_ALL_SUBMISSIONS: 'view_all_submissions',
    REVIEW_SUBMISSIONS: 'review_submissions',
    VIEW_STUDENT_PROGRESS: 'view_student_progress',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_STUDENTS: 'manage_students',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Maps each role to its list of permissions.
 * Single source of truth for role-capability relationships.
 */
export const ROLE_PERMISSIONS: Record<(typeof ROLES)[keyof typeof ROLES], Permission[]> = {
    [ROLES.STUDENT]: [
        PERMISSIONS.SUBMIT_CODE,
        PERMISSIONS.VIEW_OWN_SUBMISSIONS,
        PERMISSIONS.VIEW_OWN_PROGRESS,
        PERMISSIONS.VIEW_LEADERBOARD,
    ],
    [ROLES.TEACHER]: [
        PERMISSIONS.CREATE_PROBLEM,
        PERMISSIONS.UPDATE_OWN_PROBLEMS,
        PERMISSIONS.DELETE_OWN_PROBLEMS,
        PERMISSIONS.VIEW_QUESTION_BANK,
        PERMISSIONS.VIEW_ALL_SUBMISSIONS,
        PERMISSIONS.REVIEW_SUBMISSIONS,
        PERMISSIONS.VIEW_STUDENT_PROGRESS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.MANAGE_STUDENTS,
    ],
}
