import type {
    StudentProfile,
    StudentSidebarBrand,
    StudentSidebarItem,
} from './StudentSidebar'

export const defaultInstructorSidebarBrand: StudentSidebarBrand = {
    title: 'AIMentor',
    subtitle: 'Instructor',
}

export const defaultInstructorSidebarProfile: StudentProfile = {
    initials: 'T',
    name: 'Instructor',
    meta: 'Teaching',
}

export const defaultInstructorSidebarExpandedIds: string[] = []

export const defaultInstructorSidebarNavItems: StudentSidebarItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        page: 'instructordashboard',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V20h13V9.5" />
            </svg>
        ),
    },
    {
        id: 'question-bank',
        label: 'Question Bank',
        page: 'question-bank',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
    },
    {
        id: 'classes',
        label: 'Classes',
        page: 'classes',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16" />
                <path d="M6 6v12" />
                <path d="M18 6v12" />
                <path d="M6 18h12" />
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
        id: 'submissions',
        label: 'Submissions Review',
        page: 'submissions-review',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
                <path d="m9 15 3 3 6-6" />
            </svg>
        ),
    },
    {
        id: 'students',
        label: 'Students',
        page: 'students',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: 'analytics',
        label: 'Analytics',
        page: 'analytics',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h.5" />
                <path d="M15 13h-5" />
                <path d="M19 17h-8" />
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

export const defaultInstructorSidebarPagePathMap: Record<string, string> = {
    instructordashboard: '/instructor/dashboard',
    'question-bank': '/instructor/question-bank',
    'create-question': '/instructor/create-question',
    classes: '/classes',
    'submissions-review': '/instructor/submissions-review',
    students: '/instructor/students',
    analytics: '/instructor/analytics',
    settings: '/settings',
}
