import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'

export function UnauthorizedPage() {
    const navigate = useNavigate()
    const { user } = useAuthSession()

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
            <motion.div
                className="relative w-full max-w-md text-center"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="rounded-2xl border border-border bg-card px-7 py-12 shadow-2xl" style={{ backdropFilter: 'blur(20px)' }}>
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-500/10 p-4">
                            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0 0V9m0 0a2 2 0 012-2h6a2 2 0 012 2m0 0V7m0 4h6m0 0v6m0 0v2m0-8h-6" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="mt-6 text-3xl font-semibold text-foreground">Access Denied</h1>
                    <p className="mt-3 text-muted-foreground">
                        You don't have permission to access this page{user?.role ? ` as a ${user.role}` : ''}.
                    </p>

                    <div className="mt-8 space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(-1)}
                            className="w-full rounded bg-primary px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-primary/90"
                        >
                            Go Back
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(user?.role === 'teacher' ? '/instructor/dashboard' : '/student/dashboard')}
                            className="w-full rounded border border-border px-4 py-2.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
                        >
                            Go to Dashboard
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}
