import { NavLink } from 'react-router-dom'

type SidebarLink = {
    to: string
    label: string
}

const sidebarLinks: SidebarLink[] = [
    { to: '/student/dashboard', label: 'Student Dashboard' },
    { to: '/instructor/dashboard', label: 'Instructor Dashboard' },
    { to: '/code-lab', label: 'Code Lab' },
    { to: '/instructor/question-bank', label: 'Question Bank' },
    { to: '/instructor/create-question', label: 'Create Question' },
]

export function AppSidebar() {
    return (
        <aside className="hidden w-72 border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
            <div className="border-b border-sidebar-border px-6 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">AI Companion</p>
                <h1 className="mt-2 text-xl font-medium">Navigation</h1>
            </div>
            <nav className="flex flex-1 flex-col gap-2 p-4">
                {sidebarLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            [
                                'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            ].join(' ')
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-sidebar-border px-6 py-4 text-xs text-muted-foreground">
                Design-only scaffold
            </div>
        </aside>
    )
}
