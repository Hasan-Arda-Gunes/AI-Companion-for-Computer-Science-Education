import { Link } from 'react-router-dom'

export function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Create Account</p>
                <h1 className="mt-3 text-2xl font-medium sm:text-3xl">Register</h1>
                <p className="mt-2 text-sm text-muted-foreground">Static UI only. Account creation logic will be implemented later.</p>

                <form className="mt-6 space-y-4">
                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Full Name</span>
                        <input className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Ada Lovelace" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <input className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="you@example.com" />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Password</span>
                        <input className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="********" type="password" />
                    </label>
                    <button type="button" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        Create Account
                    </button>
                </form>

                <p className="mt-6 text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                        Log in
                    </Link>
                </p>
            </section>
        </main>
    )
}
