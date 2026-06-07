import { motion } from 'framer-motion'
import type { CodeLabHeaderData, EvolutionStage } from './types'
import { Sparkles } from 'lucide-react'

type CodeLabTopBarProps = {
    title: string
    stages: EvolutionStage[]
    headerData: CodeLabHeaderData
    onSignIn: () => void
    onSignUp: () => void
    onLogout: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CodeLabTopBar({ title }: CodeLabTopBarProps) {
    // const [showDropdown, setShowDropdown] = useState(false)
    // const initial = headerData.username?.charAt(0).toUpperCase() ?? 'U'

    return (
        <header className="border-b border-border bg-card">
            <div className="relative flex h-16 shrink-0 items-center justify-between overflow-hidden border-b border-border px-6">
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 0% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
                            'radial-gradient(circle at 100% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
                            'radial-gradient(circle at 0% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="pointer-events-none absolute inset-0"
                />

                <div className="relative z-10 flex items-center gap-2 text-foreground">
                    <Sparkles className="size-5 text-primary" />
                    <h1 className="text-lg font-bold text-foreground">{title}</h1>
                </div>

                {/* <div className="relative z-10 flex items-center gap-3">
                    {headerData.isLoggedIn ? (
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setShowDropdown((prev) => !prev)}
                                className="flex items-center gap-3 rounded border border-border bg-secondary/60 px-3 py-2"
                            >
                                <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-purple-600 text-sm font-bold text-white shadow-lg">
                                    {initial}
                                </div>
                                <span className="text-sm font-semibold text-foreground">{headerData.username ?? 'User'}</span>
                                <motion.div animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown className="size-4 text-muted-foreground" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {showDropdown ? (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Close profile menu"
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowDropdown(false)}
                                        />

                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded border border-border bg-card shadow-2xl"
                                        >
                                            <div className="border-b border-border bg-secondary/30 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-purple-600 font-bold text-white shadow-lg">
                                                        {initial}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-foreground">{headerData.username ?? 'User'}</p>
                                                        <p className="text-xs text-muted-foreground">{headerData.xp} XP • Level 12</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-2">
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <User className="size-4 text-muted-foreground" />
                                                    View Profile
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <Settings className="size-4 text-muted-foreground" />
                                                    Settings
                                                </button>
                                            </div>

                                            <div className="border-t border-border">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowDropdown(false)
                                                        onLogout()
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                                >
                                                    <LogOut className="size-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={onSignIn}
                                className="rounded border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                            >
                                Sign In
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={onSignUp}
                                className="rounded border border-primary/30 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:brightness-110"
                            >
                                Sign Up
                            </motion.button>
                        </>
                    )}
                </div> */}
            </div>

            {/* <div className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-3">
                <p className="text-xs text-muted-foreground">Current Evolution</p>
                {stages.map((stage) => (
                    <motion.div
                        key={stage.id}
                        whileHover={{ y: -1 }}
                        className={[
                            'rounded-md px-4 py-1.5 text-xs font-medium',
                            stage.active
                                ? 'bg-primary text-primary-foreground'
                                : stage.locked
                                    ? 'bg-secondary text-muted-foreground'
                                    : 'bg-secondary text-foreground',
                        ].join(' ')}
                    >
                        {stage.label}
                    </motion.div>
                ))}
            </div> */}
        </header>
    )
}
