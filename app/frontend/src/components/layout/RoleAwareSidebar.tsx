/**
 * Role-aware sidebar that automatically selects the appropriate sidebar
 * based on the current user's role.
 * 
 * Used as a fallback in DashboardLayout to ensure users always get
 * the correct navigation for their role.
 */

import { useAuthSession } from '../../features/auth/context/useAuthSession'
import { ROLES } from '../../features/auth/constants'
import { StudentSidebar } from './StudentSidebar'
import { InstructorSidebar } from './InstructorSidebar'
import {
    defaultStudentSidebarBrand,
    defaultStudentSidebarExpandedIds,
    defaultStudentSidebarNavItems,
    defaultStudentSidebarProfile,
} from './studentSidebarConfig'
import {
    defaultInstructorSidebarBrand,
    defaultInstructorSidebarExpandedIds,
    defaultInstructorSidebarNavItems,
    defaultInstructorSidebarProfile,
} from './instructorSidebarConfig'

type RoleAwareSidebarProps = {
    currentPage: string
    onNavigate: (page: string) => void
    onLogout: () => void
    className?: string
}

/**
 * Renders the appropriate sidebar based on user role.
 * Falls back to StudentSidebar if role is not recognized.
 */
export function RoleAwareSidebar({
    currentPage,
    onNavigate,
    onLogout,
    className,
}: RoleAwareSidebarProps) {
    const { user } = useAuthSession()

    if (user?.role === ROLES.TEACHER) {
        return (
            <InstructorSidebar
                className={className}
                currentPage={currentPage}
                onNavigate={onNavigate}
                onLogout={onLogout}
                brand={defaultInstructorSidebarBrand}
                profile={defaultInstructorSidebarProfile}
                defaultExpandedIds={defaultInstructorSidebarExpandedIds}
                navItems={defaultInstructorSidebarNavItems}
            />
        )
    }

    // Default to student sidebar
    return (
        <StudentSidebar
            className={className}
            currentPage={currentPage}
            onNavigate={onNavigate}
            onLogout={onLogout}
            brand={defaultStudentSidebarBrand}
            profile={defaultStudentSidebarProfile}
            defaultExpandedIds={defaultStudentSidebarExpandedIds}
            navItems={defaultStudentSidebarNavItems}
        />
    )
}
