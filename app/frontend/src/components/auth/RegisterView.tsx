import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AuthParticles } from './AuthParticles'

type RegisterViewProps = {
    fullName: string
    username: string
    email: string
    password: string
    errorMessage?: string
    isSubmitting: boolean
    onFullNameChange: (value: string) => void
    onUsernameChange: (value: string) => void
    onEmailChange: (value: string) => void
    onPasswordChange: (value: string) => void
    onSubmit: () => void
}

export function RegisterView({
    fullName,
    username,
    email,
    password,
    errorMessage,
    isSubmitting,
    onFullNameChange,
    onUsernameChange,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: RegisterViewProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
            <AuthParticles />

            <motion.div className="relative w-full max-w-md" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-7 py-8 shadow-2xl" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(30, 32, 38, 0.85)' }}>
                    <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)' }} />

                    <h1 className="relative z-10 mt-2 text-center text-4xl font-semibold leading-tight text-foreground sm:text-[2.25rem]">Create your <span className="text-primary">EvolutionAI</span> account</h1>
                    <p className="relative z-10 mt-2 text-center text-[1.02rem] text-muted-foreground">Start coding with AI guidance</p>
                    {errorMessage ? <p className="relative z-10 mt-4 text-center text-sm text-red-400">{errorMessage}</p> : null}

                    <form className="relative z-10 mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
                        <Field label="Full Name" value={fullName} placeholder="John Doe" focusedField={focusedField} setFocusedField={setFocusedField} fieldKey="fullName" onChange={onFullNameChange} />
                        <Field label="Username" value={username} placeholder="student123" focusedField={focusedField} setFocusedField={setFocusedField} fieldKey="username" onChange={onUsernameChange} />
                        <Field label="Email" value={email} placeholder="your.email@example.com" focusedField={focusedField} setFocusedField={setFocusedField} fieldKey="email" onChange={onEmailChange} />

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-foreground">Password</span>
                            <div className="flex items-center rounded border border-border bg-secondary px-3 py-2.5 transition-shadow" style={{ boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => onPasswordChange(event.target.value)}
                                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    placeholder="••••••••"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <button type="button" className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => setShowPassword((current) => !current)}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </label>

                        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="mt-1 w-full rounded bg-linear-to-r from-primary to-purple-600 px-4 py-2.5 text-base font-semibold text-white disabled:opacity-70" style={{ border: '1px solid rgba(168, 85, 247, 0.3)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </form>

                    <p className="relative z-10 mt-7 text-center text-base text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary transition-colors hover:opacity-85">Sign In</Link>
                    </p>
                </section>
            </motion.div>
        </main>
    )
}

type FieldProps = {
    label: string
    value: string
    placeholder: string
    focusedField: string | null
    setFocusedField: (value: string | null) => void
    fieldKey: string
    onChange: (value: string) => void
}

function Field({ label, value, placeholder, focusedField, setFocusedField, fieldKey, onChange }: FieldProps) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <div className="flex items-center rounded border border-border bg-secondary px-3 py-2.5 transition-shadow" style={{ boxShadow: focusedField === fieldKey ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none' }}>
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder={placeholder}
                    onFocus={() => setFocusedField(fieldKey)}
                    onBlur={() => setFocusedField(null)}
                />
            </div>
        </label>
    )
}
