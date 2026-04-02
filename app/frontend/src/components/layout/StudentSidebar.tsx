import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'student-sidebar-collapsed'

export type StudentSidebarChild = {
    id: string
    label: string
    page?: string
    icon?: ReactNode
}

export type StudentSidebarItem = {
    id: string
    label: string
    icon: ReactNode
    page?: string
    children?: StudentSidebarChild[]
}

export type StudentProfile = {
    initials: string
    name: string
    meta: string
}

export type StudentSidebarBrand = {
    title: string
    subtitle: string
}

type StudentSidebarProps = {
    currentPage: string
    onNavigate: (page: string) => void
    onLogout: () => void
    navItems: StudentSidebarItem[]
    profile: StudentProfile
    brand: StudentSidebarBrand
    defaultExpandedIds?: string[]
    className?: string
}

export function StudentSidebar({
    currentPage,
    onNavigate,
    onLogout,
    navItems,
    profile,
    brand,
    defaultExpandedIds,
    className,
}: StudentSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false
        }

        const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY)
        return stored === 'true'
    })
    const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedIds ?? [])
    const expandedWidth = 'clamp(15.5rem, 19vw, 19.5rem)'
    const collapsedWidth = 'clamp(4.5rem, 6vw, 5.25rem)'

    const resolvedClassName = useMemo(
        () => ['relative flex h-full min-h-screen flex-col overflow-hidden border-r border-sidebar-border bg-sidebar py-6', className ?? ''].join(' ').trim(),
        [className],
    )

    const toggleExpanded = (id: string) => {
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
        )
    }

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, String(isCollapsed))
    }, [isCollapsed])

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={resolvedClassName}
            style={{ backdropFilter: 'blur(10px)' }}
        >
            <div className="mb-8 flex items-start gap-2 px-4">
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="brand-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex min-w-0 flex-1 items-center gap-3"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-purple-600 shadow-[0_0_24px_var(--electric-purple-glow)]">
                                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="m8 9-4 3 4 3" />
                                    <path d="m16 9 4 3-4 3" />
                                    <path d="m14 5-4 14" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-semibold leading-tight text-foreground">{brand.title}</h2>
                                <p className="mt-0.5 truncate text-sm text-muted-foreground">{brand.subtitle}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="brand-icon"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-1 justify-center"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-purple-600 shadow-[0_0_24px_var(--electric-purple-glow)]">
                                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="m8 9-4 3 4 3" />
                                    <path d="m16 9 4 3-4 3" />
                                    <path d="m14 5-4 14" />
                                </svg>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="ml-auto mt-1 shrink-0 rounded-full border border-sidebar-border bg-secondary p-2 text-foreground transition-colors hover:border-primary hover:bg-primary"
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M4 6h16" />
                        <path d="M4 12h16" />
                        <path d="M4 18h16" />
                    </svg>
                </motion.button>
            </div>

            <nav className="flex-1 space-y-1.5 px-3">
                {navItems.map((item) => {
                    const isExpanded = expandedItems.includes(item.id)
                    const isItemActive = Boolean(item.page && currentPage === item.page)
                    const hasActiveChild = Boolean(item.children?.some((child) => child.page === currentPage))

                    return (
                        <div key={item.id}>
                            <motion.button
                                whileHover={{ x: 3 }}
                                onClick={() => {
                                    if (item.page) {
                                        onNavigate(item.page)
                                        return
                                    }
                                    if (item.children?.length) {
                                        toggleExpanded(item.id)
                                    }
                                }}
                                className={[
                                    'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all',
                                    isItemActive || hasActiveChild
                                        ? 'bg-primary text-white shadow-[0_0_20px_var(--electric-purple-glow)]'
                                        : 'text-muted-foreground hover:bg-(--slate-gray) hover:text-foreground',
                                ].join(' ')}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <div
                                    className={[
                                        'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
                                        isItemActive || hasActiveChild ? '' : 'bg-linear-to-r from-primary/10 to-transparent',
                                    ].join(' ')}
                                />

                                <span className={['relative z-10 flex items-center justify-center', isCollapsed ? 'mx-auto' : ''].join(' ')}>
                                    {item.icon}
                                </span>

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="relative z-10 flex-1 whitespace-nowrap text-left text-lg font-medium"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {!isCollapsed && item.children?.length ? (
                                    <motion.span
                                        animate={{ rotate: isExpanded ? 0 : -90 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative z-10"
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </motion.span>
                                ) : null}
                            </motion.button>

                            <AnimatePresence>
                                {!isCollapsed && item.children?.length && isExpanded ? (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-7 mt-1 space-y-1 overflow-hidden border-l-2 border-border pl-4"
                                    >
                                        {item.children.map((child) => {
                                            const isChildActive = Boolean(child.page && currentPage === child.page)

                                            return (
                                                <motion.button
                                                    key={child.id}
                                                    whileHover={{ x: 3 }}
                                                    onClick={() => {
                                                        if (child.page) {
                                                            onNavigate(child.page)
                                                        }
                                                    }}
                                                    className={[
                                                        'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-all',
                                                        isChildActive
                                                            ? 'bg-primary/20 font-medium text-primary'
                                                            : 'text-muted-foreground hover:bg-(--slate-gray)/50 hover:text-foreground',
                                                    ].join(' ')}
                                                >
                                                    <div
                                                        className={[
                                                            'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
                                                            isChildActive ? '' : 'bg-linear-to-r from-primary/10 to-transparent',
                                                        ].join(' ')}
                                                    />
                                                    <span className="relative z-10 flex items-center justify-center">
                                                        {child.icon ?? <span className="h-3 w-3 rounded-full bg-muted-foreground/40" />}
                                                    </span>
                                                    <span className="relative z-10 flex-1 whitespace-nowrap text-left">{child.label}</span>
                                                </motion.button>
                                            )
                                        })}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </nav>

            <AnimatePresence mode="wait">
                {!isCollapsed ? (
                    <motion.div
                        key="profile-expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 border-t border-sidebar-border px-3 pt-4"
                    >
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-lg">
                                {profile.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-semibold text-foreground">{profile.name}</p>
                                <p className="text-sm text-muted-foreground">{profile.meta}</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="profile-collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 flex justify-center border-t border-sidebar-border px-3 pt-4"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-lg">
                            {profile.initials}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-3 px-3">
                <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onLogout}
                    className={[
                        'flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition-colors',
                        'text-red-400 hover:bg-red-500/10 hover:text-red-300',
                        isCollapsed ? 'justify-center' : '',
                    ].join(' ')}
                    title={isCollapsed ? 'Logout' : undefined}
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5" />
                        <path d="M21 12H9" />
                    </svg>
                    <AnimatePresence>
                        {!isCollapsed ? (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap"
                            >
                                Logout
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.aside>
    )
}
