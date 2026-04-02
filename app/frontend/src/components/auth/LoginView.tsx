import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AuthParticles } from './AuthParticles'

type LoginViewProps = {
    email: string
    password: string
    errorMessage?: string
    noticeMessage?: string
    isSubmitting: boolean
    onEmailChange: (value: string) => void
    onPasswordChange: (value: string) => void
    onSubmit: () => void
}

export function LoginView({
    email,
    password,
    errorMessage,
    noticeMessage,
    isSubmitting,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: LoginViewProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
            <AuthParticles />

            <motion.div
                className="relative w-full max-w-107.5"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <section
                    className="relative overflow-hidden rounded-2xl border border-border bg-card px-7 py-8 shadow-2xl"
                    style={{
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(30, 32, 38, 0.85)',
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                            background:
                                'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
                        }}
                    />

                    <motion.div
                        className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-600 shadow-[0_0_35px_var(--electric-purple-glow)]"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                    >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="m8 9-4 3 4 3" />
                            <path d="m16 9 4 3-4 3" />
                            <path d="m14 5-4 14" />
                        </svg>
                    </motion.div>

                    <h1 className="relative z-10 mt-5 text-center text-4xl font-semibold leading-tight text-foreground sm:text-[2.25rem]">
                        Welcome to <span className="text-primary">EvolutionAI</span>
                    </h1>
                    <p className="relative z-10 mt-2 text-center text-[1.02rem] text-muted-foreground">
                        Sign in to continue your journey
                    </p>

                    {noticeMessage ? <p className="relative z-10 mt-4 text-center text-sm text-green-400">{noticeMessage}</p> : null}
                    {errorMessage ? <p className="relative z-10 mt-4 text-center text-sm text-red-400">{errorMessage}</p> : null}

                    <form
                        className="relative z-10 mt-7 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            onSubmit()
                        }}
                    >
                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-foreground">Email</span>
                            <div
                                className="flex items-center rounded border border-border bg-secondary px-3 py-2.5 transition-shadow"
                                style={{ boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none' }}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3 8 9 6 9-6" />
                                </svg>
                                <input
                                    value={email}
                                    onChange={(event) => onEmailChange(event.target.value)}
                                    className="ml-2 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    placeholder="your.email@example.com"
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-foreground">Password</span>
                            <div
                                className="flex items-center rounded border border-border bg-secondary px-3 py-2.5 transition-shadow"
                                style={{ boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none' }}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => onPasswordChange(event.target.value)}
                                    className="ml-2 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    placeholder="••••••••"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <button
                                    type="button"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </label>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className="mt-1 w-full rounded bg-linear-to-r from-primary to-purple-600 px-4 py-2.5 text-base font-semibold text-white disabled:opacity-70"
                            style={{
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                            }}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </motion.button>
                    </form>

                    <p className="relative z-10 mt-7 text-center text-base text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary transition-colors hover:opacity-85">
                            Sign Up
                        </Link>
                    </p>
                </section>
            </motion.div>
        </main>
    )
}
