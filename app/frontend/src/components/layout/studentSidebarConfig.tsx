import type {
    StudentProfile,
    StudentSidebarBrand,
    StudentSidebarItem,
} from './StudentSidebar'

export const defaultStudentSidebarBrand: StudentSidebarBrand = {
    title: 'AIMentor',
    subtitle: 'Code Evolution',
}

export const defaultStudentSidebarProfile: StudentProfile = {
    initials: 'S',
    name: 'Learner',
    meta: 'Level 12 • 1,340 XP',
}

export const defaultStudentSidebarExpandedIds = ['courses']

export const defaultStudentSidebarNavItems: StudentSidebarItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        page: 'studentdashboard',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V20h13V9.5" />
            </svg>
        ),
    },
    {
        id: 'courses',
        label: 'Courses',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 5a2 2 0 0 1 2-2h7v17H4a2 2 0 0 0-2 2Z" />
                <path d="M22 5a2 2 0 0 0-2-2h-7v17h7a2 2 0 0 1 2 2Z" />
            </svg>
        ),
        children: [
            {
                id: 'course-ds',
                label: 'Data Structures',
                page: 'course-ds',
                icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <ellipse cx="12" cy="5" rx="7" ry="3" />
                        <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
                        <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
                    </svg>
                ),
            },
            {
                id: 'course-algo',
                label: 'Algorithms',
                page: 'course-algo',
                icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="10" y="2" width="4" height="4" />
                        <rect x="3" y="16" width="4" height="4" />
                        <rect x="17" y="16" width="4" height="4" />
                        <path d="M12 6v5" />
                        <path d="M12 11H5v5" />
                        <path d="M12 11h7v5" />
                    </svg>
                ),
            },
        ],
    },
    {
        id: 'code-lab',
        label: 'Code Lab',
        page: 'codelab',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m8 9-4 3 4 3" />
                <path d="m16 9 4 3-4 3" />
                <path d="m14 5-4 14" />
            </svg>
        ),
    },
    {
        id: 'problems',
        label: 'Problems',
        page: 'problems',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </svg>
        ),
    },
    {
        id: 'classes',
        label: 'Classes',
        page: 'classes',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 7h18" />
                <path d="M7 7v12" />
                <path d="M17 7v12" />
                <path d="M5 19h14" />
            </svg>
        ),
    },
    {
        id: 'create-question',
        label: 'Create Question',
        page: 'create-question',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
        ),
    },
    {
        id: 'achievements',
        label: 'Achievements',
        page: 'achievements',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="5" />
                <path d="m8.5 13.5-1 7L12 18l4.5 2.5-1-7" />
            </svg>
        ),
    },
    {
        id: 'settings',
        label: 'Settings',
        page: 'settings',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-2 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-2 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 2 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.26.34.47.72.6 1.12a1.7 1.7 0 0 1 0 1.76 1.7 1.7 0 0 0-.6 1.12Z" />
            </svg>
        ),
    },
]

export const defaultStudentSidebarPagePathMap: Record<string, string> = {
    studentdashboard: '/student/dashboard',
    codelab: '/code-lab',
    problems: '/student/problems',
    classes: '/classes',
    'create-question': '/student/create-question',
    achievements: '/student/dashboard',
    settings: '/settings',
    'course-ds': '/student/dashboard',
    'course-algo': '/student/dashboard',
}
