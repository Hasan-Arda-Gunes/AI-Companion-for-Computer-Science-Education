import type { ReactNode } from 'react'

type AppProviderProps = {
    children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
