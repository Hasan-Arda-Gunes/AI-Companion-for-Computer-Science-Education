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
        id: 'all-questions',
        label: 'All Questions',
        page: 'instructor-all-questions',
        icon: (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 5h16" />
                <path d="M4 9h16" />
                <path d="M4 13h10" />
                <path d="M4 17h12" />
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
    'instructor-all-questions': '/instructor/all-questions',
    'create-question': '/instructor/create-question',
    classes: '/classes',
    settings: '/settings',
}
