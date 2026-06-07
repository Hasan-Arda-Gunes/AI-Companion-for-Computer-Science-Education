import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../features/auth/context/useAuthSession'
import { completeAndClearActiveLearningSession } from '../../features/sessions/sessionLifecycle'
import { DashboardLayout } from './DashboardLayout'
import {
    defaultStudentSidebarBrand,
    defaultStudentSidebarExpandedIds,
    defaultStudentSidebarNavItems,
    defaultStudentSidebarPagePathMap,
    defaultStudentSidebarProfile,
} from './studentSidebarConfig'
import type {
    StudentProfile,
    StudentSidebarBrand,
    StudentSidebarItem,
} from './StudentSidebar'
import { StudentSidebar } from './StudentSidebar'

type StudentLayoutProps = {
    currentPage: string
    title: string
    subtitle: string
    children: ReactNode
    showHeader?: boolean
    brand?: StudentSidebarBrand
    profile?: StudentProfile
    navItems?: StudentSidebarItem[]
    defaultExpandedIds?: string[]
    pagePathMap?: Record<string, string>
}

export function StudentLayout({
    currentPage,
    title,
    subtitle,
    children,
    showHeader = true,
    brand = defaultStudentSidebarBrand,
    profile,
    navItems = defaultStudentSidebarNavItems,
    defaultExpandedIds = defaultStudentSidebarExpandedIds,
    pagePathMap = defaultStudentSidebarPagePathMap,
}: StudentLayoutProps) {
    const navigate = useNavigate()
    const { user, signOut } = useAuthSession()

    useEffect(() => {
        const handleBeforeUnload = () => {
            void completeAndClearActiveLearningSession(true)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    const resolvedProfile = useMemo(() => {
        if (profile) {
            return profile
        }

        const displayName = user?.full_name?.trim() || user?.username || defaultStudentSidebarProfile.name
        const initials = displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || defaultStudentSidebarProfile.initials

        return {
            ...defaultStudentSidebarProfile,
            name: displayName,
            initials,
        }
    }, [profile, user])

    return (
        <DashboardLayout
            title={title}
            subtitle={subtitle}
            showHeader={showHeader}
            sidebar={
                <StudentSidebar
                    className="hidden lg:flex"
                    currentPage={currentPage}
                    onNavigate={(page) => {
                        const path = pagePathMap[page]
                        if (path) {
                            navigate(path)
                        }
                    }}
                    onLogout={() => {
                        void completeAndClearActiveLearningSession()
                        signOut()
                        navigate('/login', { replace: true })
                    }}
                    brand={brand}
                    profile={resolvedProfile}
                    defaultExpandedIds={defaultExpandedIds}
                    navItems={navItems}
                />
            }
        >
            {children}
        </DashboardLayout>
    )
}
