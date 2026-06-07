import type { ReactNode } from 'react'
import { AppSidebar } from './AppSidebar'

type DashboardLayoutProps = {
    title: string
    subtitle: string
    children: ReactNode
    sidebar?: ReactNode
    showHeader?: boolean
}

export function DashboardLayout({ title, subtitle, children, sidebar, showHeader = true }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            {sidebar ?? <AppSidebar />}
            <main className="flex-1">
                {showHeader ? (
                    <header className="border-b border-border px-4 py-4 sm:px-6 lg:px-10">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">AI Companion</p>
                        <h1 className="mt-2 text-2xl font-medium sm:text-3xl">{title}</h1>
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
                    </header>
                ) : null}
                <section className="p-4 sm:p-6 lg:p-10">{children}</section>
            </main>
        </div>
    )
}
