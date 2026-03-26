import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
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
    profile = defaultStudentSidebarProfile,
    navItems = defaultStudentSidebarNavItems,
    defaultExpandedIds = defaultStudentSidebarExpandedIds,
    pagePathMap = defaultStudentSidebarPagePathMap,
}: StudentLayoutProps) {
    const navigate = useNavigate()

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
                    brand={brand}
                    profile={profile}
                    defaultExpandedIds={defaultExpandedIds}
                    navItems={navItems}
                />
            }
        >
            {children}
        </DashboardLayout>
    )
}
