import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const particles = [
    { left: '8%', top: '18%', duration: 6.4, delay: 0.1 },
    { left: '18%', top: '72%', duration: 7.1, delay: 0.8 },
    { left: '26%', top: '42%', duration: 5.8, delay: 0.4 },
    { left: '34%', top: '86%', duration: 6.9, delay: 1.2 },
    { left: '42%', top: '25%', duration: 7.3, delay: 0.2 },
    { left: '55%', top: '68%', duration: 6.1, delay: 0.9 },
    { left: '63%', top: '34%', duration: 5.6, delay: 0.5 },
    { left: '74%', top: '82%', duration: 6.7, delay: 1.4 },
    { left: '82%', top: '22%', duration: 6.2, delay: 0.3 },
    { left: '90%', top: '58%', duration: 7.5, delay: 1.1 },
]

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0.6 }}
                    animate={{
                        opacity: [0.5, 0.85, 0.5],
                        scale: [1, 1.03, 1],
                    }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    style={{
                        background:
                            'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                    }}
                />
                {particles.map((particle) => (
                    <motion.div
                        key={`${particle.left}-${particle.top}`}
                        className="absolute h-1 w-1 rounded-full bg-primary"
                        style={{ left: particle.left, top: particle.top }}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 0.6, 0], y: [0, -24, 0] }}
                        transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="relative w-full max-w-md"
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
                        Create your account to start coding
                    </p>

                    <form className="relative z-10 mt-7 space-y-4">
                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-foreground">Email</span>
                            <div
                                className="flex items-center rounded border border-border bg-secondary px-3 py-2.5 transition-shadow"
                                style={{
                                    boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none',
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3 8 9 6 9-6" />
                                </svg>
                                <input
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
                                style={{
                                    boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none',
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
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
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="m3 3 18 18" />
                                            <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                            <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a19.57 19.57 0 0 1-2.22 3.38" />
                                            <path d="M6.61 6.61A19.5 19.5 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.11-.79" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="2.5" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </label>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-1 w-full rounded bg-linear-to-r from-primary to-purple-600 px-4 py-2.5 text-base font-semibold text-white"
                            style={{
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                            }}
                        >
                            Create Account
                        </motion.button>
                    </form>

                    <div className="relative z-10 mt-8 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Or continue with</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative z-10 mt-5 flex w-full items-center justify-center gap-2 rounded border border-border bg-secondary px-4 py-2.5 text-base font-semibold text-foreground transition-colors hover:opacity-90"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                            <path d="M12 .5a12 12 0 0 0-3.79 23.38c.6.12.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42a3.2 3.2 0 0 0-1.35-1.78c-1.1-.76.08-.75.08-.75a2.53 2.53 0 0 1 1.84 1.24 2.56 2.56 0 0 0 3.5 1 2.56 2.56 0 0 1 .76-1.6c-2.67-.3-5.48-1.34-5.48-5.95a4.66 4.66 0 0 1 1.24-3.24 4.3 4.3 0 0 1 .12-3.2s1-.33 3.3 1.24a11.5 11.5 0 0 1 6 0c2.28-1.57 3.3-1.24 3.3-1.24a4.3 4.3 0 0 1 .12 3.2 4.65 4.65 0 0 1 1.24 3.24c0 4.62-2.82 5.64-5.5 5.94a2.88 2.88 0 0 1 .82 2.23v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
                        </svg>
                        Sign in with GitHub
                    </motion.button>

                    <p className="relative z-10 mt-7 text-center text-base text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary transition-colors hover:opacity-85">
                            Sign In
                        </Link>
                    </p>

                    <div className="relative z-10 mt-7 border-t border-border pt-5 text-center text-[1.02rem] italic text-muted-foreground">
                        <span className="mr-1 text-primary">✧</span> Ready to{' '}
                        <span className="font-semibold text-primary">evolve</span> your code?
                    </div>
                </section>

                <p className="mt-6 text-center text-sm text-muted-foreground/80">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </main>
    )
}
