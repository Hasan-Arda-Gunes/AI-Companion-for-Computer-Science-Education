import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export function InstructorDashboardPage() {
    return (
        <DashboardLayout
            title="Instructor Dashboard"
            subtitle="Monitor classes, question performance, and student-level outcomes from one place."
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {['Active Classes', 'Pending Reviews', 'Average Completion'].map((card) => (
                    <article key={card} className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
                        <h2 className="mt-2 text-lg font-medium">{card}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Static placeholder for Figma instructor metric card.</p>
                    </article>
                ))}
            </div>

            <article className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-medium">Class Activity Snapshot</h3>
                <p className="mt-2 text-sm text-muted-foreground">Recent submission and progression activity will appear in this area.</p>
                <div className="mt-4 h-52 rounded-lg border border-dashed border-border bg-background" />
            </article>
        </DashboardLayout>
    )
}
